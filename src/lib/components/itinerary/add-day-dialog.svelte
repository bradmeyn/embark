<script lang="ts">
	import Button, { buttonVariants } from '$ui/button/button.svelte';
	import * as Dialog from '$ui/dialog/index.js';
	import Input from '$ui/input/input.svelte';
	import * as Field from '$ui/field';
	import Spinner from '$ui/spinner/spinner.svelte';
	import { addDays } from '$lib/remotes/trips/day.remote';
	import { suggestNewDayForTrip } from '$lib/remotes/trips/day.remote';
	import { getTrip } from '$lib/remotes/trips/trip.remote';
	import { Plus, Sparkles, Trash } from '@lucide/svelte';

	let {
		tripId,
		nextDayNumber,
		open = $bindable(false),
		showTrigger = true
	}: {
		tripId: string;
		nextDayNumber: number;
		open?: boolean;
		showTrigger?: boolean;
	} = $props();

	type DayRow = { dayNumber: number; location: string };

	let rows = $state<DayRow[]>([{ dayNumber: nextDayNumber, location: '' }]);
	let suggestingRow = $state<number | null>(null);

	function resetRows() {
		rows = [{ dayNumber: nextDayNumber, location: '' }];
	}

	function addMore() {
		rows = [...rows, { dayNumber: nextDayNumber + rows.length, location: '' }];
	}

	function removeAt(index: number) {
		if (rows.length <= 1) return;
		rows = rows.filter((_, i) => i !== index);
	}

	async function suggestLocation(index: number) {
		const row = rows[index];
		if (!row) return;

		suggestingRow = index;
		try {
			const result = await suggestNewDayForTrip({
				tripId,
				dayNumber: row.dayNumber
			});
			const suggestion = result.suggestion;
			if (!suggestion) return;

			rows = rows.map((existing, i) =>
				i === index
					? {
							...existing,
							location: suggestion.location ?? existing.location
						}
					: existing
			);
		} catch (e) {
			console.error('Error suggesting day location', e);
		} finally {
			suggestingRow = null;
		}
	}
</script>

<Dialog.Root bind:open>
	{#if showTrigger}
		<Dialog.Trigger class={buttonVariants({ variant: 'default', size: 'sm' })}
			>Add a Day</Dialog.Trigger
		>
	{/if}
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add more days to your trip</Dialog.Title>
			<Dialog.Description>Please provide details for the new day.</Dialog.Description>
		</Dialog.Header>

		{#each addDays.fields.issues() as issue, i (`${issue.message}-${i}`)}
			<p class="text-sm text-red-600">{issue.message}</p>
		{/each}

		<form
			{...addDays.enhance(async ({ form, submit }) => {
				try {
					await submit().updates(getTrip(tripId));
					form.reset();
					resetRows();
					open = false;
				} catch (e) {
					console.error('Error adding days', e);
				}
			})}
			class="space-y-3"
		>
			{#each rows as row, i (i)}
				<div class="group rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
					<div class="flex items-center gap-3">
						<div
							class="flex size-10 flex-col items-center justify-center rounded-lg border bg-muted/80 p-8 font-serif"
						>
							<span>Day</span>
							<span class="text-lg text-primary">{row.dayNumber}</span>
						</div>

						<Field.Field class="flex-1">
							<Field.Label for={`days-${i}-location`} class="text-xs font-medium text-gray-700">
								Location
							</Field.Label>
							<Input
								{...addDays.fields.days[i].location.as('text')}
								bind:value={rows[i].location}
								placeholder="e.g., Tokyo, Paris, New York"
								disabled={!!addDays.pending}
								class="placeholder:text-gray-400"
							/>
							<Field.Error />
						</Field.Field>

						<Button
							size="sm"
							variant="outline"
							type="button"
							onclick={() => suggestLocation(i)}
							disabled={!!addDays.pending || suggestingRow !== null}
						>
							{#if suggestingRow === i}
								<Spinner class="size-4" />
							{:else}
								<Sparkles class="size-3.5" />
								Suggest with AI
							{/if}
						</Button>

						<Button
							size="icon-sm"
							type="button"
							onclick={() => removeAt(i)}
							disabled={!!addDays.pending || rows.length <= 1}
							variant="ghost"
						>
							<Trash class="h-4 w-4" />
						</Button>
					</div>

					<!-- hidden fields -->
					<input
						{...addDays.fields.days[i].dayNumber.as('number')}
						class="hidden"
						value={row.dayNumber}
					/>
					<input type="hidden" name={`days[${i}].tripId`} value={tripId} />
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
					<Button type="button" variant="outline" onclick={() => (open = false)}>Cancel</Button>
				</Dialog.Footer>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
