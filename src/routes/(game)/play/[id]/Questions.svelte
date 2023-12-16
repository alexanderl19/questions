<script lang="ts">
	import { page } from '$app/stores';
	import { publish } from '$lib/ably';
	import { movable } from '@svelte-put/movable';
	import { ArrowUp, Hand, Grab, Send, Check } from 'lucide-svelte';
	import { onDestroy } from 'svelte';

	let question = '';
	let card: HTMLDivElement;
	let handle: HTMLDivElement;
	let moving = false;
	let submitted = false;

	const submit = async () => {
		if (!submitted) {
			const sendChannel = publish.channels.get(`game:${$page.params.id}:send`);
			await sendChannel.publish('question', question);
		}
	};

	let cardPositionTimeout: NodeJS.Timeout;
	onDestroy(() => clearInterval(cardPositionTimeout));

	const movablestart = () => {
		moving = true;

		cardPositionTimeout = setInterval(() => {
			if (parseInt(card.style.top) < -200 && !submitted) {
				submitted = true;
				submit();
			}
		}, 50);
	};

	const movableend = () => {
		moving = false;

		card.style.top = '0';
		card.style.left = '0';

		clearInterval(cardPositionTimeout);
	};
</script>

<div
	class="card"
	class:not-moving={!moving}
	bind:this={card}
	use:movable={{ handle, enabled: !submitted }}
	on:movablestart={movablestart}
	on:movableend={movableend}
>
	<form on:submit|preventDefault={submit}>
		<label>
			<span>Create A Prompt</span>
			<textarea bind:value={question} disabled={submitted} rows="10" />
		</label>
	</form>
	<div class="handle" bind:this={handle}>
		{#if !submitted}
			<span class="info">
				{#if moving}
					<Grab size={12} />
				{:else}
					<Hand size={12} />
				{/if}
				<span>Drag</span>
				<ArrowUp size={12} />
				<span>Up To</span>
				<Send size={12} />
				<span>Submit</span>
			</span>
		{:else}
			<span class="info">
				<Check size={12} />
				<span>Submitted</span>
			</span>
		{/if}

		<div class="texture" class:green={submitted} />
	</div>
</div>

<style lang="scss">
	.card {
		background-color: var(--mauve-3);
		border-radius: 24px;

		&.not-moving {
			transition:
				left 200ms cubic-bezier(0.25, 1, 0.5, 1),
				top 200ms cubic-bezier(0.25, 1, 0.5, 1);
		}
	}

	.handle {
		position: relative;
		height: 120px;

		.info {
			position: absolute;
			z-index: 1;
			display: flex;
			align-items: center;
			gap: 4px;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			font-size: 12px;
			font-weight: 500;
			color: var(--mauve-11);

			&::after {
				position: absolute;
				z-index: -1;
				content: '';
				inset: -12px -16px;
				background: radial-gradient(ellipse at center, var(--mauve-3) 50%, transparent 100%);
			}
		}

		.texture {
			height: 100%;
			background-image: radial-gradient(var(--ruby-9) 1px, transparent 0);
			background-size: 12px 12px;
			background-position: top center;
			mask: radial-gradient(ellipse at center top, black 0, transparent 95%);

			&.green {
				background-image: radial-gradient(var(--green-9) 1px, transparent 0);
			}
		}
	}

	form {
		margin-bottom: 12px;

		label {
			display: block;
			padding: 32px 24px 0 24px;

			span {
				display: block;
				color: var(--mauve-12);
				font-size: 14px;
			}

			textarea {
				all: unset;
				width: 100%;
				font-size: 20px;
				padding: 12px 0;
				box-sizing: border-box;
				word-wrap: break-word;
			}
		}
	}
</style>
