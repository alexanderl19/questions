<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/Button.svelte';
	import { onMount } from 'svelte';

	const end = async () => {};

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

<main>
	<div class="prompts">
		<h1>Waiting For Prompts</h1>
	</div>
	<div class="end">
		<span class="countdown">{secondsRemaining}</span>
		<Button size="large" color="ruby" on:click={end}>End</Button>
	</div>
</main>

<style lang="scss">
	@use '../../variables.scss' as variables;

	main {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		min-height: 100vh;
		max-width: variables.$column-width;
		margin: auto;
		padding: 24px 16px;
		gap: 16px variables.$gap;
	}

	.prompts {
		height: 100%;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-grow: 1;

		@media (min-width: variables.$breakpoint) {
			grid-column: 1 / span 2;
		}

		h1 {
			position: absolute;
			height: max-content;
			margin: 0;
			font-size: 14px;
			font-weight: 500;
		}
	}

	.end {
		--width: 100%;
		display: grid;
		grid-template-rows: max-content max-content;
		gap: 12px;

		.countdown {
			text-align: center;
			font-size: 20px;
			font-weight: 500;
		}

		@media (min-width: variables.$breakpoint) {
			grid-column: 1 / span 2;
		}
	}
</style>
