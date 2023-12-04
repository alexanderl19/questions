<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/Button.svelte';
	import { resultsState, players } from '$lib/state';

	const totalVotes = $resultsState.results.reduce(
		(partial, [_, voteCount]) => partial + voteCount,
		0
	);

	const next = async () => {
		await fetch(`/api/games/${$page.params.id}/answer`, {
			method: 'PUT',
			body: JSON.stringify({
				newQuestion: $resultsState.questionNumber + 1
			})
		});
	};
</script>

<main>
	<div class="card">
		<span class="question">{$resultsState.question}</span>
		<div class="options">
			{#each $resultsState.results as [player, voteCount]}
				<div class="option" style:--width="{(voteCount / totalVotes) * 100}%">
					<span class="label">{$players.get(player)}: {voteCount}</span>
				</div>
			{/each}
		</div>
	</div>
	<div class="next-button">
		<Button size="medium" color="ruby" on:click={next}>Next</Button>
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
	.card {
		background-color: var(--mauve-2);
		border-radius: 24px;
		padding-bottom: 12px;
	}

	.question {
		display: block;
		box-sizing: border-box;
		width: 100%;
		padding: 32px 24px 12px 24px;
		color: var(--mauve-12);
		font-size: 16px;
	}

	.options {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin: 0 12px;

		.option {
			position: relative;
			display: block;
			padding: 16px 12px;
			border-radius: 12px;
			background-color: var(--mauve-3);
			box-sizing: border-box;
			overflow: hidden;
			z-index: 10;

			.label {
				font-size: 20px;
				color: #fff;
				word-wrap: break-word;
				mix-blend-mode: exclusion;
			}

			&::after {
				position: absolute;
				z-index: -1;
				content: '';
				left: 0;
				top: 0;
				bottom: 0;
				width: var(--width);
				background-color: var(--ruby-12);
			}
		}
	}

	.next-button {
		--width: 100%;
	}
</style>
