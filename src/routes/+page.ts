import type {PageLoad} from './$types'
import * as gql from "gql-query-builder";

export const load: PageLoad = async ({url, fetch}) => {
  const apiKey = url.searchParams.get('api-key')
  if (!apiKey) {
    return {}
  }
  const cycle = url.searchParams.get('cycle') || 'isActive'
  const labels = url.searchParams.getAll('labels')
  const statuses = url.searchParams.getAll("status")
  if (statuses.length === 0) {statuses.push('Done')}
  const query = gql.query(
    labels.map(label => ({
      operation: {name: 'issues', alias: label,},
      fields: [{nodes: ['title', 'identifier', 'url']}],
      variables: {
        [`${label.toLowerCase()}Filter`]: {
          name: 'filter',
          type: 'IssueFilter',
          value: {
            cycle: {[cycle]: {eq: true}},
            state: {name: {in: statuses}},
            labels: {name: {eq: label}},
          }
        }
      }
    })),
    null,
  )
  const response = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(query)
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
    result: json.data
  }
}
