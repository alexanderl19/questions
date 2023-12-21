<script lang="ts">
	import { onMount } from 'svelte';
	import Lobby from './Lobby.svelte';
	import Write from './Write.svelte';
	import Respond from './Respond.svelte';
	import Results from './Results.svelte';
	import { connect, stage } from '$lib/client';

	onMount(() => {
		connect();

		return close;
	});
</script>

<main>
	{#if $stage === 'lobby'}
		<Lobby />
	{:else if $stage === 'write'}
		<Write />
	{:else if $stage === 'respond'}
		<Respond />
	{:else if $stage === 'results'}
		<Results />
	{/if}
</main>

<style lang="scss">
	@use '../../variables.scss' as variables;

	main {
		display: flex;
		flex-direction: column-reverse;
		min-height: 100vh;
		min-height: 100svh;
		max-width: variables.$column-width;
		margin: auto;
		box-sizing: border-box;
		padding: 24px 16px;
		gap: 16px variables.$gap;
	}
</style>
