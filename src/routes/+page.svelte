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
  let labelSelections = [
    {
      id: 'Bug',
      name: 'Bug',
    },
    {
      id: 'Feature',
      name: 'Feature',
    },
  ]
  let releaseNotes
</script>

<title>Linear Formatter</title>
<h1>Linear Formatter</h1>
<form>
  <label for="api-key">API Key:</label>
  <input type="text" name="api-key" id="api-key" bind:value={apiKey}>
  <input type="text" name="api-key" value={apiKey}>
  <label for="label-select">Labels</label>
  <select name="labels" id="label-select" multiple>
    {#each labelSelections as label}
      <option value={label.id}>{label.name}</option>
    {/each}
  </select>
  <button type="submit">Generate</button>
</form>

{#if errorMessage}
  <p>{errorMessage}</p>
{/if}

{#if releaseNotes}
  <p>{JSON.stringify(releaseNotes)}</p>
{/if}

{#if data.data}
  <article id="notes">
    <ul>
      {#each Object.entries(data.data) as [label, {nodes}] (label)}
        <li>
          {label}
          <ul>
            {#each nodes as {url, identifier, title} (identifier)}
              <li>
                <a href={url}>[{identifier}] {title}</a>
              </li>
            {/each}
          </ul>
        </li>
      {/each}
    </ul>
  </article>

  <button on:click={copyToClipboard}>Copy</button>

{/if}
