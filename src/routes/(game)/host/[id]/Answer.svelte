<script lang="ts">
	import { page } from '$app/stores';
	import { answerState } from '$lib/state';

	const next = async () => {
		await fetch(`/api/games/${$page.params.id}/results`, {
			method: 'PUT'
		});
	};
</script>

Question: {$answerState.question}

{$answerState.players}

<button on:click={next}>Next</button>
