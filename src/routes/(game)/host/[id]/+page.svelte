<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { state, joinChannel } from '$lib/state';
	import Join from './Join.svelte';
	import Questions from './Questions.svelte';
	import Answer from './Answer.svelte';
	import Results from './Results.svelte';

	onMount(() => {
		joinChannel($page.params.id);
	});
</script>

<main>
	{#if $state === 'join'}
		<Join />
	{:else if $state === 'questions'}
		<Questions />
	{:else if $state === 'answer'}
		<Answer />
	{:else if $state === 'results'}
		<Results />
	{/if}
</main>

<style lang="scss">
	@use '../../variables.scss' as variables;

	main {
		display: grid;
		max-width: variables.$column-wdith;
		grid-template-columns: 1fr;
		margin: 24px auto;
		padding: 0 16px;
		gap: 16px variables.$gap;

		@media (min-width: variables.$breakpoint) {
			max-width: calc(variables.$column-wdith * 2 + variables.$gap);
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
