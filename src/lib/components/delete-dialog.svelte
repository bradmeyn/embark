<script lang="ts">
	import * as AlertDialog from '$ui/alert-dialog/index.js';
	import { Trash } from '@lucide/svelte';
	import { buttonVariants } from '$ui/button';
	import Spinner from '$ui/spinner/spinner.svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		label: string;
		onDelete: () => Promise<void> | void;
		trigger?: Snippet;
		loading?: boolean;
	};

	let { label, onDelete, trigger, loading }: Props = $props();
	let open = $state(false);
	let internalLoading = $state(false);
	const isLoading = $derived(loading ?? internalLoading);

	async function handleDelete() {
		if (!onDelete) return;
		try {
			internalLoading = true;
			await onDelete();
			open = false;
		} catch (error) {
			console.error('Failed to delete', error);
		} finally {
			internalLoading = false;
		}
	}
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Trigger>
		{#if trigger}
			{@render trigger()}
		{:else}
			<button class={buttonVariants({ variant: 'ghost', size: 'sm' })} type="button">
				<Trash class="size-4" />
			</button>
		{/if}
	</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete {label}</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. The {label} and any related data will be permanently removed.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel disabled={isLoading}>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				disabled={isLoading}
				class={buttonVariants({ variant: 'destructive' })}
				onclick={handleDelete}
			>
				{#if isLoading}
					<div class="flex items-center gap-2">
						<Spinner class="size-4" />
						<span>Deleting...</span>
					</div>
				{:else}
					Delete
				{/if}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
