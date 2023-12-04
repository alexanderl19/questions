<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/Button.svelte';
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

	let secondsRemaining = 60 * 1.5;
	onMount(() => {
		const timer = setInterval(() => {
			secondsRemaining--;
			if (secondsRemaining <= 0) {
				end();
				clearInterval(timer);
			}
		}, 1000);
		return () => clearInterval(timer);
	});
</script>

<div class="prompts">
	<h1>Waiting For Prompts</h1>
</div>
<div class="end">
	<span class="countdown">{secondsRemaining}</span>
	<Button size="large" color="ruby" on:click={end}>End</Button>
</div>

<style lang="scss">
	.prompts {
		height: 100%;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-grow: 1;

		h1 {
			position: absolute;
			height: max-content;
			margin: 0;
			font-size: 14px;
			font-weight: 500;
		}
	}

	.end {
		display: grid;
		grid-template-rows: max-content max-content;
		gap: 12px;

		.countdown {
			text-align: center;
			font-size: 20px;
			font-weight: 500;
		}

		--width: 100%;
	}
</style>
