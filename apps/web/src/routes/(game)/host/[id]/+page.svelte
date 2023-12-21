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

{#if $stage === 'lobby'}
	<Lobby />
{:else if $stage === 'write'}
	<Write />
{:else if $stage === 'respond'}
	<Respond />
{:else if $stage === 'results'}
	<Results />
{/if}

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
</style>
