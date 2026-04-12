<script lang="ts">
	import Button from '$ui/button/button.svelte';
	import * as Dialog from '$ui/dialog/index.js';
	import Input from '$ui/input/input.svelte';
	import * as Field from '$ui/field';
	import Spinner from '$ui/spinner/spinner.svelte';
	import {
		editTravelSegment,
		deleteTravelSegment,
		refreshCarRoute
	} from '$lib/remotes/trips/travel-segment.remote';
	import { getTrip } from '$lib/remotes/trips/trip.remote';
	import type { TravelSegment } from '$db/schemas/itinerary';
	import {
		Car,
		TrainFront,
		Bus,
		Ship,
		Bike,
		PersonStanding,
		HelpCircle,
		Trash,
		RefreshCw
	} from '@lucide/svelte';

	let {
		segment,
		tripId,
		open = $bindable(false),
		showTrigger = false
	}: {
		segment: TravelSegment;
		tripId: string;
		open?: boolean;
		showTrigger?: boolean;
	} = $props();

	const MODES = [
		{ value: 'car', label: 'Car', Icon: Car },
		{ value: 'train', label: 'Train', Icon: TrainFront },
		{ value: 'bus', label: 'Bus', Icon: Bus },
		{ value: 'ferry', label: 'Ferry', Icon: Ship },
		{ value: 'walk', label: 'Walk', Icon: PersonStanding },
		{ value: 'bike', label: 'Bike', Icon: Bike },
		{ value: 'other', label: 'Other', Icon: HelpCircle }
	] as const;

	let selectedMode = $state(segment.mode);
	let refreshing = $state(false);
	let submitError = $state<string | null>(null);

	const segmentForm = $derived(editTravelSegment.for(segment.id));
</script>

<Dialog.Root bind:open>
	{#if showTrigger}
		<Dialog.Trigger>Edit Travel</Dialog.Trigger>
	{/if}

	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit Travel Segment</Dialog.Title>
			<Dialog.Description>Update travel details between destinations.</Dialog.Description>
		</Dialog.Header>

		{#each segmentForm.fields.issues() as issue (issue.message)}
			<p class="text-sm text-red-600">{issue.message}</p>
		{/each}
		{#if submitError}
			<p class="text-sm text-destructive">{submitError}</p>
		{/if}

		<form
			{...segmentForm.enhance(async ({ submit }) => {
				submitError = null;
				try {
					await submit().updates(getTrip(tripId));
					open = false;
				} catch (e) {
					console.error('Error editing travel segment', e);
					submitError = 'Failed to save. Please try again.';
				}
			})}
			class="space-y-4"
		>
			<Field.Field>
				<Field.Label>Travel Mode</Field.Label>
				<div class="grid grid-cols-4 gap-2">
					{#each MODES as m (m.value)}
						{@const active = selectedMode === m.value}
						<button
							type="button"
							onclick={() => (selectedMode = m.value)}
							class="flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-xs font-medium transition-colors {active
								? 'border-primary bg-primary/10 text-primary'
								: 'border-border bg-background text-muted-foreground hover:bg-muted'}"
						>
							<m.Icon class="size-5" />
							{m.label}
						</button>
					{/each}
				</div>
				<input {...segmentForm.fields.mode.as('text')} type="hidden" value={selectedMode} />
				<Field.Error />
			</Field.Field>

			<div class="grid grid-cols-2 gap-3">
				<Field.Field>
					<Field.Label for="departureTime">Departure</Field.Label>
					<Input
						id="departureTime"
						{...segmentForm.fields.departureTime.as('text')}
						value={segment.departureTime ?? ''}
						type="time"
						step="60"
						class="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden"
					/>
					<Field.Error />
				</Field.Field>

				<Field.Field>
					<Field.Label for="arrivalTime">Arrival</Field.Label>
					<Input
						id="arrivalTime"
						{...segmentForm.fields.arrivalTime.as('text')}
						value={segment.arrivalTime ?? ''}
						type="time"
						step="60"
						class="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden"
					/>
					<Field.Error />
				</Field.Field>
			</div>

			<Field.Field>
				<Field.Label for="cost">Cost</Field.Label>
				<Input
					id="cost"
					{...segmentForm.fields.cost.as('text')}
					value={segment.cost ?? ''}
					placeholder="e.g. 45.00"
				/>
				<Field.Error />
			</Field.Field>

			<Field.Field>
				<Field.Label for="notes">Notes</Field.Label>
				<textarea
					id="notes"
					{...segmentForm.fields.notes.as('text')}
					rows="2"
					class="w-full rounded-md border bg-background p-2 text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
					>{segment.notes ?? ''}</textarea
				>
				<Field.Error />
			</Field.Field>

			<Dialog.Footer class="flex-wrap gap-2">
				{#if selectedMode === 'car'}
					<Button
						type="button"
						variant="outline"
						size="sm"
						disabled={refreshing}
						onclick={async () => {
							refreshing = true;
							try {
								await refreshCarRoute({ segmentId: segment.id });
							} catch (e) {
								console.error('Failed to refresh route', e);
							} finally {
								refreshing = false;
							}
						}}
					>
						{#if refreshing}
							<Spinner class="size-4" />
						{:else}
							<RefreshCw class="size-3.5" />
						{/if}
						Refresh Route
					</Button>
				{/if}

				<Button
					type="button"
					variant="ghost"
					size="sm"
					class="text-destructive hover:text-destructive"
					onclick={async () => {
						try {
							await deleteTravelSegment({ id: segment.id });
							open = false;
						} catch (e) {
							console.error('Error deleting segment', e);
						}
					}}
				>
					<Trash class="size-3.5" />
					Delete
				</Button>

				<div class="ml-auto flex gap-2">
					<Button type="submit" disabled={!!segmentForm.pending}>
						{#if segmentForm.pending}
							<Spinner class="size-4" />
						{:else}
							Save
						{/if}
					</Button>
					<Button type="button" variant="outline" onclick={() => (open = false)}>Cancel</Button>
				</div>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
