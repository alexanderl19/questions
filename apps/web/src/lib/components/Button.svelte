<script lang="ts">
	import clsx from 'clsx';

	export let as = 'button';
	export let color: 'mauve' | 'ruby' = 'mauve';
	export let size: 'large' | 'medium';
</script>

<svelte:element
	this={as}
	class={clsx('button', color, size)}
	role="button"
	tabindex="0"
	on:click
	{...$$restProps}
>
	<slot />
</svelte:element>

<style lang="scss">
	.button {
		all: unset;
		box-sizing: border-box;
		border-radius: var(--border-radius, 24px);
		text-align: center;
		width: var(--width, max-content);
		transition: transform 300ms cubic-bezier(0.33, 1, 0.68, 1);

		&.large {
			padding: 12px 24px;
			font-size: 24px;
		}
		&.medium {
			padding: 8px 12px;
			font-size: 16px;
		}

		&.mauve {
			background-color: var(--mauve-2);
			border: 1.5px solid var(--mauve-7);
			color: var(--mauve-a11);
		}
		&.ruby {
			background-color: var(--ruby-2);
			border: 1.5px solid var(--ruby-7);
			color: var(--ruby-a11);
		}

		&:hover {
			&.mauve {
				border: 1.5px solid var(--mauve-8);
			}
			&.ruby {
				border: 1.5px solid var(--ruby-8);
			}
			transform: scale(1.02);
		}
		&:active {
			&.mauve {
				background-color: var(--mauve-3);
			}
			&.ruby {
				background-color: var(--ruby-3);
			}
		}
	}
</style>
