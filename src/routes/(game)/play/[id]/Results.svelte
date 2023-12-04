<script lang="ts">
	import { resultsState, players } from '$lib/state';
</script>

Question: {$resultsState.question}

{#each $resultsState.results as [player, voteCount]}
	{$players.get(player)} {voteCount}
{/each}
