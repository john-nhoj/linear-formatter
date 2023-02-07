import type {PageLoad} from './$types'
import * as gql from "gql-query-builder";

export const load: PageLoad = async ({url, fetch}) => {
  const apiKey = url.searchParams.get('api-key')
  if (!apiKey) {
    return {}
  }
  const cycle = url.searchParams.get('cycle')
  const labels = url.searchParams.getAll('labels')
  const statuses = url.searchParams.getAll("status")
  const shouldSearch = cycle && labels.length > 0
  if (statuses.length === 0) {
    statuses.push('Done')
  }
  const filtersQuery = gql.query([
      {
        operation: 'cycles',
        fields: [{nodes: ['number']}]
      },
      {
        operation: 'issueLabels',
        fields: [{nodes: ['name']}]
      },
    ],
  )
  const filtersResponse = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(filtersQuery)
  })
  if (!filtersResponse.ok && filtersResponse.status === 400) {
    const data = await filtersResponse.json()
    return {
      errorMessage: data.errors[0].message,
      apiKey,
    }
  }
  const filtersJson = await filtersResponse.json()
  const body: {
    apiKey: string,
    filters: { cycles: { options: Array<number>, selected: string }, labels: { options: Array<string>, selected: Array<string> } },
    search?: Record<string, { nodes: { url: string, identifier: string, title: string } }>
    errorMessage?: string,
  } = {
    apiKey,
    filters: {
      cycles: {
        options: filtersJson.data.cycles.nodes.sort((a: { number: number; }, b: { number: number; }) => b.number > a.number).map((node: { number: number }) => ({
          id: node.number,
          name: `Cycle ${node.number}`
        })),
        selected: Number(cycle) || filtersJson.data.cycles.nodes[0].number,
      },
      labels: {
        options: filtersJson.data.issueLabels.nodes.map((node: { name: string }) => ({id: node.name, name: node.name})),
        selected: labels,
      }
    },
  }
  if (shouldSearch) {
    const searchQuery = gql.query([
        ...labels.map(label => ({
              operation: {name: 'issues', alias: label,},
              fields: [{nodes: ['title', 'identifier', 'url']}],
              variables: {
                [`${label.toLowerCase()}Filter`]: {
                  name: 'filter',
                  type: 'IssueFilter',
                  value: {
                    cycle: {number: {eq: Number(cycle)}},
                    state: {name: {in: statuses}},
                    labels: {name: {eq: label}},
                  }
                }
              }
            }
          )
        )
      ]
    )
    const searchResponse = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchQuery)
    })
    if (!searchResponse.ok) {
      const {errors} = await searchResponse.json()
      body.errorMessage = errors[0].message
      return body
    }
    const searchJson = await searchResponse.json()
    body.search = searchJson.data
  }
  return body
}
