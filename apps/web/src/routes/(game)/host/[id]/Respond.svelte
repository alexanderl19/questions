<script lang="ts">
	import { send, respond } from '$lib/client';

	const next = async () => {
		send('stage-results', {});
	};
</script>

Question: {$respond?.promptText}

<!-- {$answerState.players} -->

<button on:click={next}>Next</button>
