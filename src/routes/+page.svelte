<script lang="ts">
  import {enhance} from '$app/forms'

  function enhanceForm() {
    validatingApiKey = true
    return async function ({result}) {
      if (result.type !== 'success') {
        errorMessage = 'Invalid API key. Please verify you are using the correct key.'
      }
      validatingApiKey = false
    }
  }

  function handleGeneration() {
    generatingReleaseNotes = true
    return async function ({result}) {
      if (result.type !== 'success') {
        errorMessage = 'Something went wrong. Please try again.'
      }
      releaseNotes = result.data
      debugger
      generatingReleaseNotes = false
    }
  }

  export let apiKey = ''
  export let errorMessage = ''
  export let validatingApiKey = false
  export let generatingReleaseNotes = false
  export let labelSelections = [
    {
      id: '1',
      name: 'Label 1'
    },
    {
      id: '2',
      name: 'Label 2'
    },
    {
      id: '3',
      name: 'Label 3'
    }
  ]
  export let releaseNotes
</script>

<title>Linear Formatter</title>
<h1>Linear Formatter</h1>
<form method="post" action="?/validateApiKey" use:enhance={enhanceForm}>
  <label for="api-key">API Key:</label>
  <input type="text" name="api-key" id="api-key" bind:value={apiKey} disabled={validatingApiKey}>
  <button>Validate</button>
</form>

<form method="post" action="?/generate" use:enhance={handleGeneration}>
  <label for="label-select">Labels</label>
  <select name="label-select" id="label-select" multiple>
    {#each labelSelections as label}
      <option value={label.id}>{label.name}</option>
    {/each}
  </select>
  <button type="submit" disabled={generatingReleaseNotes}>Generate</button>
</form>

{#if errorMessage}
  <p>{errorMessage}</p>
{/if}

{#if generatingReleaseNotes}
  <p>Generating release notes...</p>
{/if}

{#if releaseNotes}
  <p>{JSON.stringify(releaseNotes)}</p>
{/if}
