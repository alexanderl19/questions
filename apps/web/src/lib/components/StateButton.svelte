<script lang="ts">
	import clsx from 'clsx';
	import { Loader, Check } from 'lucide-svelte';

	export let as = 'button';
	export let color: 'mauve' | 'ruby' = 'ruby';
	export let state: 'action' | 'loading' | 'success';
</script>

<svelte:element
	this={as}
	class={clsx('button', color, state)}
	role="button"
	tabindex="0"
	on:click
	{...$$restProps}
>
	{#if state !== 'action'}
		<div class="icon">
			{#if state === 'loading'}
				<div class="loader">
					<Loader size={16} />
				</div>
			{:else if state === 'success'}
				<div class="check">
					<Check size={16} />
				</div>
			{/if}
		</div>
	{:else}
		<slot />
	{/if}
</svelte:element>

<style lang="scss">
	$line-height: 20px;

	.icon {
		line-height: 0;
		height: 20px;
	}

	.loader {
		@keyframes spinning {
			from {
				transform: rotate(0deg);
			}
			to {
				transform: rotate(360deg);
			}
		}
		animation: spinning 1s linear infinite;
	}

	.check {
		@keyframes check {
			0% {
				transform: rotate(-20deg);
			}
			50% {
				transform: rotate(5deg) scale(1.5);
			}
			100% {
				transform: rotate(0deg);
			}
		}
		animation: check 800ms cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.button {
		all: unset;
		box-sizing: border-box;
		text-align: center;
		width: 100%;
		border-top: var(--border);
		padding: 24px 24px;
		font-size: 16px;
		line-height: $line-height;

		&.action {
			&.mauve {
				background-color: var(--mauve-2);
				color: var(--mauve-a11);
				--border: 1.5px solid var(--mauve-7);

				&:hover {
					--border: 1.5px solid var(--mauve-8);
				}
			}

			&.ruby {
				background-color: var(--ruby-2);
				color: var(--ruby-a11);
				--border: 1.5px solid var(--ruby-7);

				&:hover {
					--border: 1.5px solid var(--ruby-8);
				}
			}
		}

		&.loading {
			background-color: var(--mauve-2);
			color: var(--mauve-a11);
			--border: 1.5px solid var(--mauve-7);

			&:hover {
				--border: 1.5px solid var(--mauve-8);
			}
		}

		&.success {
			background-color: var(--green-2);
			color: var(--green-a11);
			--border: 1.5px solid var(--green-7);

			&:hover {
				--border: 1.5px solid var(--green-8);
			}
		}

		&:active.action {
			&.ruby {
				background-color: var(--ruby-3);
			}
		}
	}
</style>
