<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	import Join from './Join.svelte';
	import Questions from './Questions.svelte';
	// import Answer from './Answer.svelte';
	// import Results from './Results.svelte';
	import { connect, stage } from '$lib/client';

	onMount(() => {
		connect();

		return close;
	});
</script>

{#if $stage === 'lobby'}
	<Join />
{:else if $stage === 'write'}
	<Questions />
{:else if $stage === 'respond'}
	<!-- <Answer /> -->
{:else if $stage === 'results'}
	<!-- <Results /> -->
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
