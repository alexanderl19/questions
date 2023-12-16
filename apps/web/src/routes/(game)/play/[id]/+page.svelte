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
