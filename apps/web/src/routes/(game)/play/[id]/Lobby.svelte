<script lang="ts">
	import { secret, name, nameState, send } from '$lib/client';
	import StateButton from '$lib/components/StateButton.svelte';
	import { onDestroy } from 'svelte';

	let buttonState: 'join' | 'loading' | 'success' | 'rename' = 'join';
	let successIndicatorTimeout: NodeJS.Timeout;
	const join = () => {
		if (buttonState === 'join') buttonState = 'loading';
		send('hello', { name: $name, secret: $secret });
	};

	$: {
		clearTimeout(successIndicatorTimeout);
		if ($nameState.joined) {
			buttonState = 'success';
			successIndicatorTimeout = setTimeout(() => {
				buttonState = 'rename';
			}, 1500);
		}
	}

	onDestroy(() => successIndicatorTimeout && clearTimeout(successIndicatorTimeout));
</script>

<div class="card">
	<form on:submit|preventDefault={join}>
		<label>
			<span>Name</span>
			<input bind:value={$name} />
		</label>
		<div class="submit">
			<StateButton
				color={buttonState === 'rename' ? 'mauve' : 'ruby'}
				state={buttonState === 'join' || buttonState === 'rename' ? 'action' : buttonState}
			>
				{#if buttonState === 'join'}
					Join
				{:else if buttonState === 'rename'}
					Change Name
				{/if}
			</StateButton>
		</div>
	</form>
</div>

<style lang="scss">
	.card {
		background-color: var(--mauve-3);
		border-radius: 24px;
		overflow: hidden;
	}

	form {
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
			--width: 100%;
		}
	}
</style>
