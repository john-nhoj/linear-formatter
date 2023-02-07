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
  if (statuses.length === 0) {
    statuses.push('Done')
  }
  const queries = [
    gql.query([
        {
          operation: 'cycles',
          fields: [{nodes: ['number']}]
        },
        {
          operation: 'issueLabels',
          fields: [{nodes: ['name']}]
        },
      ],
      null,
    )
  ]
  if (labels.length > 0) {
    queries.push(gql.query([
          ...labels.map(label => ({
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
              }
            )
          ),
        ]
      )
    )
  }
  const [filtersResponse, searchResponse] = await Promise.all(queries.map(query => fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(query)
  })))
  if (!filtersResponse.ok && filtersResponse.status === 400) {
    const {errors} = await filtersResponse.json()
    return {
      errorMessage: errors[0].message,
      apiKey,
    }
  }
  const filtersJson = await filtersResponse.json()
  const body: {
    apiKey: string,
    filters: {cycles: {options: Array<number>, selected: string}, labels: {options: Array<string>, selected: Array<string>}},
    search: Record<string, {nodes: {url: string, identifier: string, title: string}}>
  } = {
    apiKey,
    filters: {
      cycles: {
        options: filtersJson.data.cycles.nodes.map((node: { number: number}) => ({id: node.number, name: `Cycle ${node.number}`})),
        selected: cycle,
      },
      labels: {
        options: filtersJson.data.issueLabels.nodes.map((node: { name: string }) => ({id: node.name, name: node.name})),
        selected: labels,
      }
    },
    search: {},
  }
  if (labels.length > 0) {
    const searchJson = await searchResponse.json()
    body.search = searchJson.data
  }
  return body
}
