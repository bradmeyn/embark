<script lang="ts">
	import Button, { buttonVariants } from '$ui/button/button.svelte';
	import * as Dialog from '$ui/dialog/index.js';
	import Input from '$ui/input/input.svelte';
	import * as Field from '$ui/field';
	import { addFlight } from '$lib/remotes/flight.remote';
	import { getTrip } from '$lib/remotes/trip.remote';
	import Spinner from '$ui/spinner/spinner.svelte';
	import { Plus } from '@lucide/svelte';

	let {
		dayId,
		tripId,
		open = $bindable(false),
		showTrigger = true
	}: {
		dayId: string;
		tripId: string;
		open?: boolean;
		showTrigger?: boolean;
	} = $props();

	async function onSubmitEnhance({ form, submit }: any) {
		try {
			await submit().updates(getTrip(tripId));
			form.reset();
			open = false;
		} catch (e) {
			console.error('Error adding flight', e);
		}
	}
</script>

<Dialog.Root bind:open>
	{#if showTrigger}
		<Dialog.Trigger
			class={buttonVariants({ variant: 'outline', size: 'sm' })}
			aria-label="Add flight"
		>
			<Plus class="mr-1.5 size-3.5" />
			Add Flight
		</Dialog.Trigger>
	{/if}

	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add Flight</Dialog.Title>
			<Dialog.Description>Add flight details for this day.</Dialog.Description>
		</Dialog.Header>

		{#each addFlight.fields.issues() as issue}
			<p class="text-sm text-red-600">{issue.message}</p>
		{/each}

		<form {...addFlight.for(dayId).enhance(onSubmitEnhance)} class="space-y-3">
			<div class="grid grid-cols-2 gap-2">
				<Field.Field>
					<Field.Label for="airline">Airline</Field.Label>
					<Input
						id="airline"
						{...addFlight.fields.airline.as('text')}
						autocomplete="off"
						placeholder="e.g., Japan Airlines"
					/>
					<Field.Error />
				</Field.Field>

				<Field.Field>
					<Field.Label for="flightNumber">Flight Number</Field.Label>
					<Input
						id="flightNumber"
						{...addFlight.fields.flightNumber.as('text')}
						placeholder="e.g., JL123"
					/>
					<Field.Error />
				</Field.Field>
			</div>

			<div class="grid grid-cols-2 gap-2">
				<Field.Field>
					<Field.Label for="departureAirport">From</Field.Label>
					<Input
						id="departureAirport"
						{...addFlight.fields.departureAirport.as('text')}
						placeholder="e.g., NRT"
					/>
					<Field.Error />
				</Field.Field>

				<Field.Field>
					<Field.Label for="arrivalAirport">To</Field.Label>
					<Input
						id="arrivalAirport"
						{...addFlight.fields.arrivalAirport.as('text')}
						placeholder="e.g., HND"
					/>
					<Field.Error />
				</Field.Field>
			</div>

			<div class="grid grid-cols-2 gap-2">
				<Field.Field>
					<Field.Label for="departureTime">Departure</Field.Label>
					<Input
						id="departureTime"
						{...addFlight.fields.departureTime.as('text')}
						type="time"
						class="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
					/>
					<Field.Error />
				</Field.Field>

				<Field.Field>
					<Field.Label for="arrivalTime">Arrival</Field.Label>
					<Input
						id="arrivalTime"
						{...addFlight.fields.arrivalTime.as('text')}
						type="time"
						class="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
					/>
					<Field.Error />
				</Field.Field>
			</div>

			<div class="grid grid-cols-2 gap-2">
				<Field.Field>
					<Field.Label for="confirmationNumber">Confirmation #</Field.Label>
					<Input
						id="confirmationNumber"
						{...addFlight.fields.confirmationNumber.as('text')}
						placeholder="Optional"
					/>
					<Field.Error />
				</Field.Field>

				<Field.Field>
					<Field.Label for="cost">Cost</Field.Label>
					<Input id="cost" {...addFlight.fields.cost.as('number')} min="0" step="0.01" />
					<Field.Error />
				</Field.Field>
			</div>

			<Field.Field>
				<Field.Label for="notes">Notes</Field.Label>
				<textarea
					id="notes"
					{...addFlight.fields.notes.as('text')}
					rows="2"
					class="w-full rounded-md border p-2"
					placeholder="Any additional notes..."
				></textarea>
				<Field.Error />
			</Field.Field>

			<input type="hidden" name="dayId" value={dayId} />

			<div class="mt-4 flex justify-end">
				<Dialog.Footer>
					<Button type="submit" disabled={!!addFlight.pending}>
						{#if addFlight.pending}
							<Spinner class="size-4" />
						{:else}
							Add Flight
						{/if}
					</Button>
				</Dialog.Footer>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
