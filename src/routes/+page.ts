import type {PageLoad} from './$types'

export const load: PageLoad = async ({url, fetch}) => {
  const apiKey = url.searchParams.get('api-key')
  if (!apiKey) {
    return {}
  }
  const response = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `query Issues($bugsFilter: IssueFilter) {
                  Bugs: issues(filter: $bugsFilter) {
                    nodes {
                      title
                      identifier
                      url
                      labels {
                        nodes {
                          name
                        }
                      }
                    }
                  }
                }`,
      variables: {
        filter: {
          cycle: {
            isFuture: {
              eq: true
            }
          }
        },
        bugsFilter: {
          cycle: {
            isFuture: {
              eq: true
            }
          },
          completedAt: {
            null: false
          },
          labels: {
            name: {
              eq: "Bug"
            }
          }
        }
      }
    })
  })
  if (!response.ok) {
    switch (response.status) {
      case 400:
        return {
          errorMessage: 'Api key is invalid. Please check your api key and try again.'
        }
      default:
        throw new Error(`HTTP error! status: ${response.status}`)
    }
  }
  const json = await response.json()
  return {
    apiKey,
    data: json.data
  }
}
