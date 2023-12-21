<script lang="ts">
	import { onMount } from 'svelte';
	import { send, writeState } from '$lib/client';
	import Button from '$lib/components/Button.svelte';

	const end = async () => {
		send('stage-respond', {});
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

<main>
	<div class="prompts">
		<h1>Waiting For Prompts</h1>
		<div class="cards">
			{#each new Array($writeState.promptCount) as _, i (i)}
				<div class="card" style:--rotate="{Math.random() * 30 - 15}deg" />
			{/each}
		</div>
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

	.cards {
		position: absolute;
		width: 256px;
		height: calc(256px * 3.5 / 2.5);

		.card {
			@keyframes card-in {
				0% {
					transform: scale(1.2) rotate(var(--rotate));
				}
				100% {
					transform: rotate(var(--rotate));
				}
			}

			position: absolute;
			width: 256px;
			height: calc(256px * 3.5 / 2.5);
			border-radius: 12px;
			background-color: var(--mauve-2);
			box-shadow:
				0px 0px 0px rgba(33, 31, 38, 0.01),
				0px 0px 2px rgba(33, 31, 38, 0.02),
				0px 0px 3px rgba(33, 31, 38, 0.03),
				0px 0px 6px rgba(33, 31, 38, 0.04),
				0px 0px 9px rgba(33, 31, 38, 0.05),
				0px 0px 14px rgba(33, 31, 38, 0.06),
				0px 0px 18px rgba(33, 31, 38, 0.07),
				0px 0px 24px rgba(33, 31, 38, 0.08);
			animation: card-in 500ms forwards cubic-bezier(0.34, 1.56, 0.64, 1);
		}
	}

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
		--width: 100%;
		display: grid;
		grid-template-rows: max-content max-content;
		gap: 12px;

		.countdown {
			text-align: center;
			font-size: 20px;
			font-weight: 500;
		}
	}
</style>
