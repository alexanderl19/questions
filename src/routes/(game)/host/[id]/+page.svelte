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

{#if $state === 'join'}
	<Join />
{:else if $state === 'questions'}
	<Questions />
{:else if $state === 'answer'}
	<Answer />
{:else if $state === 'results'}
	<Results />
{/if}
