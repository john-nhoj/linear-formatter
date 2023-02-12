<script lang="ts">
  import {enhance} from '$app/forms'

  export let data

  let errorMessage = data?.errorMessage
  let selectedLabels = data?.labels || []
  let selectedCycle = data?.cycle

  let apiKey = data?.apiKey
  let labelSelections = []
  let cycleSelections = []
  let syncing = false
  let synced = data?.synced || false
  let syncedSuccessfully = false

  // Form enhancers
  async function syncApiKey() {
    syncing = true
    errorMessage = undefined
    return async function (callbackOptions) {
      const {result} = callbackOptions
      if (result.type !== 'success') {
        errorMessage = 'Syncing failed... Verify you api key or try again later!'
      }
      const {labels, cycles} = result.data
      labelSelections = labels
      cycleSelections = cycles
      if (!selectedCycle) {
        selectedCycle = cycles[0].id
      }
      syncedSuccessfully = true
      synced = true
      syncing = false
      setTimeout(() => {
        syncedSuccessfully = false
      }, 2000)
    }
  }

  let searching = false
  let searchResults
  function search({data}) {
    searching = true
    errorMessage = undefined
    const labels = data.getAll('labels')
    const cycle = data.get('cycle')
    if (!cycle || labels.length <= 0) {
      errorMessage = 'Please select a cycle and at least one label'
      searching = false
      return
    }
    return async function (callbackOptions) {
      const {result} = callbackOptions
      if (result.type !== 'success') {
        errorMessage = 'Searching failed... Verify you api key or try again later!'
      }
      searchResults = result.data
      searching = false
    }
  }

  // User interactions
  async function copyToClipboard() {
    const notes = document.getElementById('notes')
    const content = notes.innerHTML
    const blob = new Blob([content], {type: 'text/html'})
    const richTextInput = new ClipboardItem({'text/html': blob})
    try {
      await navigator.clipboard.write([richTextInput])
    } catch (e) {
      errorMessage = 'Copying to clipboard failed... Try again later!'
    } finally {
      console.info('Notes copied to clipboard successfully')
    }
  }
</script>

<title>Linear Formatter</title>
<main class="max-w-4xl mx-auto">
  <div class="mt-4 border p-4 rounded">
    <h1 class="text-lg font-medium leading-6 text-gray-900">Linear formatter</h1>
    <p class="mt-1 max-w-2xl text-sm text-gray-500">This will use your API key to access Linear data so be careful with
      whom you share.</p>
    <form method="post" action="?/sync" use:enhance={syncApiKey}
          class="mt-4 border-t border-gray-200">
      <div class="grid grid-cols-3 items-start gap-4 pt-5">
        <label for="api-key" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">API Key</label>
        <div class="mt-1 sm:col-span-2 sm:mt-0 flex">
          <input required type="text" name="api-key" id="api-key" bind:value={apiKey}
                 class="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
          <button type="submit" disabled={syncing}
                  class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400">
            {#if syncedSuccessfully}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                   stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                   stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
              </svg>
            {/if}
          </button>
        </div>
      </div>
    </form>
    {#if synced}
      <form method="post" action="?/search" use:enhance={search} class="mt-4 border-t border-gray-200">
        <input required type="text" name="api-key" bind:value={apiKey} class="hidden"/>
        <div class="space-y-4">
          <!-- Cycles -->
          <div class="grid grid-cols-3 items-start gap-4 pt-5">
            <label for="cycle-select" class="block text-sm font-medium text-gray-700 mt-px pt-2">Cycle</label>
            <div class="mt-1 col-span-2 mt-0">
              <select bind:value={selectedCycle} name="cycle" id="cycle-select"
                      class="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm">
                {#each cycleSelections as cycle}
                  <option value={cycle.id}>{cycle.name}</option>
                {/each}
              </select>
            </div>
          </div>
          <!-- Labels -->
          <fieldset class="grid grid-cols-3 items-start gap-4 pt-5">
            <legend class="sr-only">Labels</legend>
            <p class="block text-sm font-medium text-gray-700 mt-px">Labels</p>
            <div class="mt-1 col-span-2 flex flex-col gap-2" class:animate-pulse={!synced}>
              {#if !synced}
                <div class="flex gap-2 items-center">
                  <input type="checkbox" name="labels" disabled
                         class="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                  <p class="h-2 w-1/3 rounded ml-2 bg-slate-700"></p>
                </div>
                <div class="flex gap-2 items-center">
                  <input type="checkbox" name="labels" disabled
                         class="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                  <p class="h-2 w-1/3 rounded ml-2 bg-slate-700"></p>
                </div>
              {/if}
              {#each labelSelections as label}
                <div class="flex gap-2 items-center">
                  <input type="checkbox" name="labels" id="label-{label.id}" bind:group={selectedLabels}
                         value={label.id}
                         class="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                  <label for="label-{label.id}" class="ml-2 block text-sm text-gray-900">{label.name}</label>
                </div>
              {/each}
            </div>
          </fieldset>
          <div class="flex justify-end">
            <button type="submit" disabled={searching}
                    class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400">
              Get Issues
            </button>
          </div>
        </div>
      </form>
    {/if}
  </div>
  {#if errorMessage}
    <p>{errorMessage}</p>
  {/if}
  {#if searchResults}
    <article id="notes">
      <ul>
        {#each Object.entries(searchResults) as [label, {nodes}] (label)}
          <li>
            {label}
            {#if nodes.length > 0}
              <ul>
                {#each nodes as {url, identifier, title} (identifier)}
                  <li>
                    <a href={url}>[{identifier}] {title}</a>
                  </li>
                {/each}
              </ul>
            {:else}
              <p>No issues found</p>
            {/if}
          </li>
        {/each}
      </ul>
    </article>
    <button on:click={copyToClipboard}>Copy</button>
  {/if}
</main>
