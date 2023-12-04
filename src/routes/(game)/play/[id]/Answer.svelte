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

<div class="card">
	<form on:submit|preventDefault={submit}>
		<fieldset>
			<legend>{$answerState.question}</legend>
			<div class="options">
				{#each $answerState.players as [id, name]}
					<label>
						<input type="radio" name="contact" value={id} bind:group={answer} />
						<span>{name}</span>
					</label>
				{/each}
			</div>
		</fieldset>
	</form>
</div>

<style lang="scss">
	.card {
		background-color: var(--mauve-2);
		border-radius: 24px;
	}

	form {
		margin-bottom: 12px;

		fieldset {
			all: unset;
			width: 100%;

			legend {
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
			}

			label {
				padding: 16px 12px;
				font-size: 24px;
				border-radius: 12px;
				display: flex;
				transition: transform 300ms cubic-bezier(0.33, 1, 0.68, 1);
				background-color: var(--mauve-3);
				color: var(--mauve-a11);

				&:hover {
					background-color: var(--mauve-4);
					transform: scale(1.02);
				}
				&:active {
					background-color: var(--mauve-5);
				}

				input {
					appearance: none;
					background-color: none;
					margin: 0;
				}

				span {
					display: block;
					color: var(--mauve-12);
					font-size: 14px;
					font-size: 20px;
					box-sizing: border-box;
					word-wrap: break-word;
				}
			}
		}
	}
</style>
