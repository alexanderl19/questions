<script lang="ts">
	import { page } from '$app/stores';
	// import { subscribe } from '$lib/ably';
	import { onMount } from 'svelte';

	const end = async () => {
		await fetch(`/api/games/${$page.params.id}/state`, {
			method: 'PUT',
			body: JSON.stringify({
				newState: 'answer'
			})
		});
		await fetch(`/api/games/${$page.params.id}/answer`, {
			method: 'PUT',
			body: JSON.stringify({
				newQuestion: 0
			})
		});
	};

	onMount(() => {
		// const timer = setTimeout(
		// 	() => {
		// 		end();
		// 	},
		// 	1000 * 60 * 1.5
		// );
		// return () => clearTimeout(timer);
	});
</script>

Questions

<button on:click={end}>End</button>
