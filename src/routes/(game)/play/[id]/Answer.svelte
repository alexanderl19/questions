<script lang="ts">
	import { page } from '$app/stores';
	import { publish } from '$lib/ably';
	import { answerState } from '$lib/state';

	let answer = '';

	const submit = async () => {
		if ($answerState.players.map(([id]) => id).includes(answer)) {
			const channel = publish.channels.get(`game:${$page.params.id}:send`);
			await channel.publish('answer', answer);
		}
	};
</script>

<form on:submit|preventDefault={submit}>
	<fieldset>
		<legend>{$answerState.question}</legend>
		{#each $answerState.players as [id, name]}
			<label>
				<input type="radio" name="contact" value={id} bind:group={answer} />
				{name}
			</label>
		{/each}
	</fieldset>
	<button type="submit">Submit</button>
</form>

<!-- <button on:click={end}>End</button> -->
