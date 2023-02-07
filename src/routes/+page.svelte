<script lang="ts">
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

  export let data
  let apiKey = data?.apiKey || ''
  let errorMessage = data?.errorMessage || ''
  let selectedLabels = data?.filters?.labels.selected || []
  let labelSelections = data?.filters?.labels.options || []
  let cycleSelections = data?.filters?.cycles.options || []
  let selectedCycle = data?.filters?.cycles.selected
</script>

<title>Linear Formatter</title>
<main class="max-w-4xl mx-auto">
  <div class="mt-4 border p-4 rounded">
    <h1 class="text-lg font-medium leading-6 text-gray-900">Linear formatter</h1>
    <p class="mt-1 max-w-2xl text-sm text-gray-500">This information will be displayed publicly so be careful what
      you share.</p>
    <form class="mt-4 divide-y divide-gray-200">
      <div class="space-y-4">
        <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
          <label for="api-key" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">API Key</label>
          <div class="mt-1 sm:col-span-2 sm:mt-0">
            <input required type="text" name="api-key" id="api-key" bind:value={apiKey}
                   class="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
          </div>
        </div>
        <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
          <label for="cycle-select" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Cycle</label>
          <div class="mt-1 sm:col-span-2 sm:mt-0">
            <select required bind:value={selectedCycle} name="cycle" id="cycle-select"
                    class="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm">
              {#each cycleSelections as cycle}
                <option value={cycle.id}>{cycle.name}</option>
              {/each}
            </select>
          </div>
        </div>
        <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
          <label for="label-select" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Labels</label>
          <div class="mt-1 sm:col-span-2 sm:mt-0">
            <select multiple required bind:value={selectedLabels} name="labels" id="label-select"
                    class="p-0 block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm">
              {#each labelSelections as cycle}
                <option class="min-h-[2rem]" value={cycle.id}>{cycle.name}</option>
              {/each}
            </select>
          </div>
        </div>
        <div class="flex justify-end">
          <button type="submit"
                  class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            Get Issues
          </button>
        </div>
      </div>
    </form>
  </div>
  {#if errorMessage}
    <p>{errorMessage}</p>
  {/if}
  {#if data.search}
    <article id="notes">
      <ul>
        {#each Object.entries(data.search) as [label, {nodes}] (label)}
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
