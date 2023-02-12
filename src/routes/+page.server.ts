import type {Actions} from "@sveltejs/kit";
import * as gql from "gql-query-builder";
import {fail} from "@sveltejs/kit";

export const actions: Actions = {
  sync: async ({request, fetch}) => {
    const data = await request.formData()
    const apiKey = String(data.get('api-key'))
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
    if (filtersResponse.ok) {
      const filtersJson = await filtersResponse.json()
      return {
        cycles: filtersJson.data.cycles.nodes
          // FIXME sorting is not working as expected
          .sort((a: { number: number; }, b: { number: number; }) => b.number > a.number)
          .map((node: { number: number }) => ({
            id: node.number,
            name: `Cycle ${node.number}`
          })),
        labels: filtersJson.data.issueLabels.nodes.map((node: { name: string }) => ({id: node.name, name: node.name})),
      }
    }
    return fail(400, {errorMessage: 'Invalid API key'})
  },
  search: async ({request, fetch}) => {
    const data = await request.formData()
    const apiKey = String(data.get('api-key'))
    const cycle = Number(data.get('cycle'))
    const labels = data.getAll('labels').map(label => String(label))
    const statuses = ['Done']
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
    if (searchResponse.ok) {
      const searchJson = await searchResponse.json()
      return searchJson.data
    }
    return fail(400, {errorMessage: 'Invalid API key'})
  }
}
