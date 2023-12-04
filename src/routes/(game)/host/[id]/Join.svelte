<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { subscribe } from '$lib/ably';
	import qrcode from 'qrcode-generator';
	import { Copy, Check, X } from 'lucide-svelte';
	import Button from '$lib/components/Button.svelte';

	const url = new URL(`/play/${$page.params.id}`, $page.url);

	const qr = qrcode(0, 'H');
	qr.addData(url.toString());
	qr.make();
	const qrSvg = qr.createSvgTag({ margin: 0, scalable: true });

	let players = new Map<string, string>([]);
	let playersArray = Array.from(players.entries());

	onMount(() => {
		const channel = subscribe.channels.get(`game:${$page.params.id}:receive`);
		channel.presence.subscribe(['enter', 'present', 'update'], (player) => {
			players.set(player.clientId, player.data);
			playersArray = Array.from(players.entries());
		});
		channel.presence.subscribe('leave', (player) => {
			players.delete(player.clientId);
			playersArray = Array.from(players.entries());
		});
	});

	let resetCopyIconTimeout: NodeJS.Timeout;
	let copyState: 'success' | 'fail' | undefined;
	const copy = async () => {
		try {
			await navigator.clipboard.writeText(url.toString());
			copyState = 'success';
		} catch (error) {
			copyState = 'fail';
		} finally {
			clearTimeout(resetCopyIconTimeout);
			resetCopyIconTimeout = setTimeout(() => {
				copyState = undefined;
			}, 1000);
		}
	};

	const start = () => {
		fetch(`/api/games/${$page.params.id}/state`, {
			method: 'PUT',
			body: JSON.stringify({
				newState: 'questions'
			})
		});
	};
</script>

<main>
	<div class="join">
		<div class="qr">
			{@html qrSvg}
		</div>
		<button class="copy" on:click={copy}>
			<span>{$page.params.id}</span>
			<div class="icon" class:success={copyState === 'success'} class:fail={copyState === 'fail'}>
				{#if copyState === undefined}
					<Copy size={16} />
				{:else if copyState === 'success'}
					<Check size={16} />
				{:else if copyState === 'fail'}
					<X size={16} />
				{/if}
			</div>
		</button>
	</div>

	<div class="players">
		<ul>
			{#each playersArray as [id, name] (id)}
				<li>{name}</li>
			{/each}
		</ul>
	</div>

	<div class="start">
		<Button color="ruby" size="large" on:click={start}>Everyone's in!</Button>
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

		@media (min-width: variables.$breakpoint) {
			max-width: calc(variables.$column-width * 2 + variables.$gap);
			display: grid;
			grid-template-columns: 1fr 1fr;
			grid-template-rows: 1fr max-content;
		}
	}

	.join {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		padding: 32px 24px;
		background-color: var(--mauve-3);
		border-radius: 24px;
		gap: 24px;
		grid-column: 1;
		grid-row: 1;
		height: max-content;
	}

	.qr {
		aspect-ratio: 1 / 1;

		:global(rect) {
			display: none;
		}
		:global(path) {
			fill: var(--mauve-12);
		}
	}

	.copy {
		all: unset;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		font-size: 20px;
		transition: transform 300ms cubic-bezier(0.33, 1, 0.68, 1);

		&:hover {
			transform: scale(1.02);
			.icon {
				color: var(--mauve-12);
			}
		}

		.icon {
			transition: color 100ms;
			color: var(--mauve-11);
			line-height: 0;

			&.success {
				color: var(--green-11);
			}
			&.fail {
				color: var(--red-11);
			}
		}
	}

	.players {
		grid-column: 1;
		grid-row: 2;
		padding: 24px;
		background-color: var(--mauve-3);
		border-radius: 24px;

		@media (min-width: variables.$breakpoint) {
			grid-column: 2;
			grid-row: 1;
		}

		ul {
			padding: 0;
			margin: 0;
			list-style-type: none;
		}

		li {
			font-size: 20px;
			margin: 6px 0;
		}
	}

	.start {
		grid-column: 1;
		grid-row: 3;
		--width: 100%;

		@media (min-width: variables.$breakpoint) {
			grid-column: 2;
			grid-row: 2;
		}
	}
</style>
