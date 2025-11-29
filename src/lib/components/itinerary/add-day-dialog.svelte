<script lang="ts">
	import Button, { buttonVariants } from '$ui/button/button.svelte';
	import * as Dialog from '$ui/dialog/index.js';
	import Input from '$ui/input/input.svelte';
	import * as Field from '$ui/field';
	import Spinner from '$ui/spinner/spinner.svelte';
	import { addDays } from '$lib/remotes/day.remote';
	import { Plus, Trash } from '@lucide/svelte';

	let {
		itineraryId,
		nextDayNumber
	}: {
		itineraryId: string;
		nextDayNumber: number;
	} = $props();

	let days = $state([nextDayNumber]);

	function addMore() {
		days = [...days, nextDayNumber + days.length];
	}

	function removeAt(index: number) {
		if (days.length <= 1) return;
		days = days.filter((_, i) => i !== index);
	}
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonVariants({ variant: 'default', size: 'sm' })}
		>Add a Day</Dialog.Trigger
	>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add more days to your trip</Dialog.Title>
			<Dialog.Description>Please provide details for the new day.</Dialog.Description>
		</Dialog.Header>

		{#each addDays.fields.issues() as issue}
			<p class="text-sm text-red-600">{issue.message}</p>
		{/each}

		<form {...addDays} class="space-y-3">
			{#each days as day, i (i)}
				<div class="group rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
					<div class="flex items-center gap-3">
						<div
							class="flex size-10 flex-col items-center justify-center rounded-lg border bg-muted/80 p-8 font-serif"
						>
							<span>Day</span>
							<span class="text-lg text-primary">{i + 1}</span>
						</div>

						<Field.Field class="flex-1">
							<Field.Label for={`days-${i}-location`} class="text-xs font-medium text-gray-700">
								Location
							</Field.Label>
							<Input
								{...addDays.fields.days[i].location.as('text')}
								placeholder="e.g., Tokyo, Paris, New York"
								disabled={!!addDays.pending}
								class="placeholder:text-gray-400"
							/>
							<Field.Error />
						</Field.Field>

						<Button
							size="icon-sm"
							onclick={() => removeAt(i)}
							disabled={!!addDays.pending || days.length <= 1}
							variant="ghost"
						>
							<Trash class="h-4 w-4" />
						</Button>
					</div>

					<!-- hidden fields -->
					<input {...addDays.fields.days[i].dayNumber.as('number')} class="hidden" value={day} />
					<input type="hidden" name={`days[${i}].itineraryId`} value={itineraryId} />
				</div>
			{/each}

			<div class="flex items-center justify-between pt-2">
				<Button
					size="sm"
					onclick={addMore}
					disabled={!!addDays.pending}
					variant="outline"
					class="gap-2 border-orange-200 text-primary hover:bg-orange-50"
				>
					<Plus class="h-4 w-4" />
					Add Another Day
				</Button>
			</div>

			<div class="mt-4 flex justify-end">
				<Dialog.Footer>
					<Button type="submit" disabled={!!addDays.pending}>
						{#if addDays.pending}
							<Spinner class="size-4" />
						{:else}
							Add Days
						{/if}
					</Button>
					<Button type="button" variant="outline">Cancel</Button>
				</Dialog.Footer>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
