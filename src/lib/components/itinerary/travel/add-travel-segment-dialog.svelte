<script lang="ts">
	import Button from '$ui/button/button.svelte';
	import * as Dialog from '$ui/dialog/index.js';
	import Input from '$ui/input/input.svelte';
	import * as Field from '$ui/field';
	import Spinner from '$ui/spinner/spinner.svelte';
	import { addTravelSegment } from '$lib/remotes/trips/travel-segment.remote';
	import { getTrip } from '$lib/remotes/trips/trip.remote';
	import { Car, TrainFront, Bus, Ship, Bike, PersonStanding, HelpCircle } from '@lucide/svelte';

	let {
		fromDayId,
		tripId,
		open = $bindable(false),
		showTrigger = false
	}: {
		fromDayId: string;
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

	let selectedMode = $state<string>('car');
	let submitError = $state<string | null>(null);
</script>

<Dialog.Root bind:open>
	{#if showTrigger}
		<Dialog.Trigger>Add Travel</Dialog.Trigger>
	{/if}

	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add Travel Segment</Dialog.Title>
			<Dialog.Description>Record how you're getting to the next destination.</Dialog.Description>
		</Dialog.Header>

		{#each addTravelSegment.fields.issues() as issue (issue.message)}
			<p class="text-sm text-red-600">{issue.message}</p>
		{/each}
		{#if submitError}
			<p class="text-sm text-destructive">{submitError}</p>
		{/if}

		<form
			{...addTravelSegment.enhance(async ({ form, submit }) => {
				submitError = null;
				try {
					await submit().updates(getTrip(tripId));
					form.reset();
					selectedMode = 'car';
					open = false;
				} catch (e) {
					console.error('Error adding travel segment', e);
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
				<input {...addTravelSegment.fields.mode.as('text')} type="hidden" value={selectedMode} />
				<Field.Error />
			</Field.Field>

			<div class="grid grid-cols-2 gap-3">
				<Field.Field>
					<Field.Label for="departureTime">Departure</Field.Label>
					<Input
						id="departureTime"
						{...addTravelSegment.fields.departureTime.as('text')}
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
						{...addTravelSegment.fields.arrivalTime.as('text')}
						type="time"
						step="60"
						class="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden"
					/>
					<Field.Error />
				</Field.Field>
			</div>

			<Field.Field>
				<Field.Label for="cost">Cost</Field.Label>
				<Input id="cost" {...addTravelSegment.fields.cost.as('text')} placeholder="e.g. 45.00" />
				<Field.Error />
			</Field.Field>

			<Field.Field>
				<Field.Label for="notes">Notes</Field.Label>
				<textarea
					id="notes"
					{...addTravelSegment.fields.notes.as('text')}
					rows="2"
					placeholder="e.g. Book tickets in advance"
					class="w-full rounded-md border bg-background p-2 text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
				></textarea>
				<Field.Error />
			</Field.Field>

			<input type="hidden" name="fromDayId" value={fromDayId} />

			<Dialog.Footer>
				<Button type="submit" disabled={!!addTravelSegment.pending}>
					{#if addTravelSegment.pending}
						<Spinner class="size-4" />
					{:else}
						Save
					{/if}
				</Button>
				<Button type="button" variant="outline" onclick={() => (open = false)}>Cancel</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
