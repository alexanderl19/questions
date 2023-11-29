<script lang="ts">
	import { page } from '$app/stores';
	import { publish } from '$lib/ably';

	let question = '';

	const submit = async () => {
		const channel = publish.channels.get(`game:${$page.params.id}:send`);
		await channel.publish('question', question);
	};
</script>

<form on:submit|preventDefault={submit}>
	<label>
		Question
		<input bind:value={question} />
	</label>
	<button>Submit</button>
</form>
