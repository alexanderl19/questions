<script lang="ts">
	export let as = 'button';
</script>

<svelte:element this={as} class="button" role="button" tabindex="0" on:click {...$$restProps}>
	<slot />
</svelte:element>

<style lang="scss">
	.button {
		all: unset;
		box-sizing: border-box;
		background-color: var(--ruby-2);
		border: 1.5px solid var(--ruby-7);
		color: var(--ruby-a11);
		padding: 12px 24px;
		border-radius: 24px;
		font-size: 24px;
		text-align: center;
		width: var(--width, max-content);
		transition: transform 300ms cubic-bezier(0.33, 1, 0.68, 1);

		&:hover {
			border: 1.5px solid var(--ruby-8);
			transform: scale(1.02);
		}
		&:active {
			background-color: var(--ruby-3);
		}
	}
</style>
