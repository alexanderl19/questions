<script lang="ts">
	import { playerData, send } from '$lib/client';
	import Button from '$lib/components/Button.svelte';

	let name = '';

	const join = () => {
		send('hello', { name, secret: $playerData?.secret });
	};
</script>

<div class="card">
	<form on:submit|preventDefault={join}>
		<label>
			<span>Name</span>
			<input bind:value={name} />
		</label>
		<div class="submit">
			<Button color="ruby" size="medium">Join</Button>
		</div>
	</form>
</div>

<style lang="scss">
	.card {
		background-color: var(--mauve-3);
		border-radius: 24px;
	}

	form {
		margin-bottom: 12px;

		label {
			display: block;
			padding: 32px 24px 24px 24px;

			span {
				display: block;
				color: var(--mauve-12);
				font-size: 14px;
			}

			input {
				all: unset;
				width: 100%;
				font-size: 20px;
				padding: 12px 0;
				box-sizing: border-box;
				word-wrap: break-word;
			}
		}

		.submit {
			padding: 0 12px;
			--width: 100%;
			--border-radius: calc(24px - 12px);
		}
	}
</style>
