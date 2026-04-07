<script lang="ts">
	import * as Dialog from '$ui/dialog/index.js';
	import Button from '$ui/button/button.svelte';
	import Input from '$ui/input/input.svelte';
	import * as Field from '$ui/field';
	import { PackageCheck, Trash2, RotateCcw } from '@lucide/svelte';
	import {
		getPackingItems,
		addPackingItem,
		togglePackingItem,
		deletePackingItem,
		clearPackedItems
	} from '$lib/remotes/trips/packing.remote';
	import Spinner from '$ui/spinner/spinner.svelte';

	let {
		tripId,
		open = $bindable(false),
		showTrigger = true
	}: {
		tripId: string;
		open?: boolean;
		showTrigger?: boolean;
	} = $props();

	let addError = $state<string | null>(null);
</script>

<Dialog.Root bind:open>
	{#if showTrigger}
		<Dialog.Trigger class="flex items-center gap-2">
			<PackageCheck class="size-4" />
			Packing List
		</Dialog.Trigger>
	{/if}

	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>Packing List</Dialog.Title>
			<Dialog.Description>Track what to bring on this trip.</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4 py-1">
			<!-- Add item form -->
			<form
				{...addPackingItem.for(tripId).enhance(async ({ form, submit }) => {
					addError = null;
					try {
						await submit();
						form.reset();
					} catch (e) {
						console.error('Error adding packing item', e);
						addError = 'Failed to add item. Please try again.';
					}
				})}
				class="flex gap-2"
			>
				<input type="hidden" name="tripId" value={tripId} />
				<div class="flex flex-1 gap-2">
					<Field.Field class="flex-1">
						<Input
							{...addPackingItem.fields.name.as('text')}
							placeholder="Add an item..."
							autocomplete="off"
						/>
						<Field.Error />
					</Field.Field>
					<Field.Field class="w-28">
						<Input
							{...addPackingItem.fields.category.as('text')}
							placeholder="Category"
							autocomplete="off"
						/>
					</Field.Field>
				</div>
				<Button type="submit" size="sm" disabled={!!addPackingItem.pending}>
					{#if addPackingItem.pending}
						<Spinner class="size-4" />
					{:else}
						Add
					{/if}
				</Button>
			</form>

			{#each addPackingItem.fields.issues() as issue (issue.message)}
				<p class="text-sm text-destructive">{issue.message}</p>
			{/each}
			{#if addError}
				<p class="text-sm text-destructive">{addError}</p>
			{/if}

			<svelte:boundary>
				{#snippet pending()}
					<div class="py-4 text-center text-sm text-muted-foreground">Loading...</div>
				{/snippet}

				{@const items = await getPackingItems(tripId)}
				{@const packed = items.filter((i) => i.packed)}
				{@const unpacked = items.filter((i) => !i.packed)}
				{@const categories = [...new Set(items.map((i) => i.category).filter(Boolean))]}

				<p class="text-sm text-muted-foreground">{packed.length} of {items.length} items packed</p>

				{#if items.length === 0}
					<div class="rounded-lg border border-dashed py-8 text-center">
						<PackageCheck class="mx-auto mb-2 size-8 text-muted-foreground/50" />
						<p class="text-sm text-muted-foreground">No items yet. Add something above.</p>
					</div>
				{:else}
					<div class="max-h-80 space-y-1 overflow-y-auto">
						<!-- Unpacked items -->
						{#each unpacked as item (item.id)}
							<div class="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50">
								<input
									type="checkbox"
									checked={item.packed}
									onchange={() => togglePackingItem({ itemId: item.id, packed: !item.packed })}
									class="size-4 cursor-pointer accent-primary"
								/>
								<span class="flex-1 text-sm">{item.name}</span>
								{#if item.category}
									<span class="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
										{item.category}
									</span>
								{/if}
								<Button
									variant="ghost"
									size="icon"
									class="size-6 text-muted-foreground hover:text-destructive"
									onclick={() => deletePackingItem({ itemId: item.id })}
								>
									<Trash2 class="size-3" />
								</Button>
							</div>
						{/each}

						<!-- Packed items -->
						{#if packed.length > 0}
							<div class="mt-3 border-t pt-2">
								<p class="mb-1 px-2 text-xs text-muted-foreground">Packed ({packed.length})</p>
								{#each packed as item (item.id)}
									<div
										class="flex items-center gap-2 rounded-md px-2 py-1.5 opacity-60 hover:bg-muted/50"
									>
										<input
											type="checkbox"
											checked={item.packed}
											onchange={() =>
												togglePackingItem({ itemId: item.id, packed: !item.packed })}
											class="size-4 cursor-pointer accent-primary"
										/>
										<span class="flex-1 text-sm line-through">{item.name}</span>
										{#if item.category}
											<span
												class="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary"
											>
												{item.category}
											</span>
										{/if}
										<Button
											variant="ghost"
											size="icon"
											class="size-6 text-muted-foreground hover:text-destructive"
											onclick={() => deletePackingItem({ itemId: item.id })}
										>
											<Trash2 class="size-3" />
										</Button>
									</div>
								{/each}
							</div>
						{/if}
					</div>

					{#if packed.length > 0}
						<div class="border-t pt-2">
							<Button
								variant="ghost"
								size="sm"
								class="gap-1.5 text-muted-foreground"
								onclick={() => clearPackedItems({ tripId })}
							>
								<RotateCcw class="size-3.5" />
								Clear all packed items
							</Button>
						</div>
					{/if}
				{/if}
			</svelte:boundary>
		</div>
	</Dialog.Content>
</Dialog.Root>
