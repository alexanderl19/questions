<script lang="ts">
	import { page } from '$app/stores';
	import { subscribe } from '$lib/ably';

	let name = '';

	const join = () => {
		const channel = subscribe.channels.get(`game:${$page.params.id}:receive`);
		channel.presence.enter(name);
	};
</script>

<form on:submit|preventDefault={join}>
	<label>
		<span>Name</span>
		<input bind:value={name} />
	</label>
	<button>Join</button>
</form>
