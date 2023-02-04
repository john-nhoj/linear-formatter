import type {Actions} from "@sveltejs/kit";
import {fail} from "@sveltejs/kit";

export const actions: Actions = {
  validateApiKey: async ({cookies, request}) => {
    const data = await request.formData()
    const apiKey = data.get('api-key')
    if (!apiKey) {
      return fail(400, {message: 'Missing api-key'})
    }
    cookies.set('api-key', apiKey.toString())
    return {success: true}
  },
  generate: async function ({cookies}) {
    const apiKey = cookies.get('api-key')
    if (!apiKey) {
      return fail(400, {message: 'Missing api-key'})
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
      return fail(500)
    }
    const json = await response.json()
    return json.data
  }
};
