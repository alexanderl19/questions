<script lang="ts">
	import { page } from '$app/stores';
	import { subscribe } from '$lib/ably';
	import qrcode from 'qrcode-generator';
	import { onMount } from 'svelte';

	const qr = qrcode(0, 'H');
	qr.addData(new URL(`/play/${$page.params.id}`, $page.url).toString());
	qr.make();
	const qrSvg = qr.createSvgTag();

	let players = new Map<string, string>([]);
	let playersArray = Array.from(players.entries());

	onMount(() => {
		const channel = subscribe.channels.get(`game:${$page.params.id}:receive`);
		channel.presence.subscribe(['enter', 'present'], (player) => {
			players.set(player.clientId, player.data);
			playersArray = Array.from(players.entries());
		});
		channel.presence.subscribe('leave', (player) => {
			players.delete(player.clientId);
			playersArray = Array.from(players.entries());
		});
	});

	const start = () => {
		fetch(`/api/games/${$page.params.id}/state`, {
			method: 'PUT',
			body: JSON.stringify({
				newState: 'questions'
			})
		});
	};
</script>

{$page.params.id}
{@html qrSvg}

{#each playersArray as [id, name]}
	{id}: {name}
{/each}

<button on:click={start}>Start</button>
