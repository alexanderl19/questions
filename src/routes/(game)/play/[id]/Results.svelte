<script lang="ts">
	import { page } from '$app/stores';
	import { resultsState } from '$lib/state';

	const next = async () => {
		await fetch(`/api/games/${$page.params.id}/answer`, {
			method: 'PUT',
			body: JSON.stringify({
				newQuestion: $resultsState.questionNumber + 1
			})
		});
	};
</script>

Question: {$resultsState.question}

{$resultsState.results}

<button on:click={next}>Next</button>
