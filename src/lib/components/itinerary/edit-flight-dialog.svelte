<script lang="ts">
	import Button from '$ui/button/button.svelte';
	import * as Dialog from '$ui/dialog/index.js';
	import Input from '$ui/input/input.svelte';
	import * as Field from '$ui/field';
	import { editFlight } from '$lib/remotes/flight.remote';
	import { getItinerary } from '$lib/remotes/itinerary.remote';
	import Spinner from '$ui/spinner/spinner.svelte';
	import type { Flight } from '$db/schemas/itinerary';

	let {
		flight,
		itineraryId,
		open = $bindable(false),
		showTrigger = true
	}: {
		flight: Flight;
		itineraryId: string;
		open?: boolean;
		showTrigger?: boolean;
	} = $props();

	const flightForm = $derived(editFlight.for(flight.id));

	async function onSubmitEnhance({ submit }: any) {
		try {
			await submit().updates(getItinerary(itineraryId));
			if (flightForm.result?.success) {
				open = false;
			}
		} catch (e) {
			console.error('Error editing flight', e);
		}
	}
</script>

<Dialog.Root bind:open>
	{#if showTrigger}
		<Dialog.Trigger class="flex items-center gap-2">Edit Flight</Dialog.Trigger>
	{/if}

	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit Flight</Dialog.Title>
			<Dialog.Description>Update the flight details.</Dialog.Description>
		</Dialog.Header>

		{#each flightForm.fields.issues() as issue}
			<p class="text-sm text-red-600">{issue.message}</p>
		{/each}

		<form {...flightForm.enhance(onSubmitEnhance)} class="space-y-3">
			<input type="hidden" name="id" value={flight.id} />

			<div class="grid grid-cols-2 gap-2">
				<Field.Field>
					<Field.Label for="airline">Airline</Field.Label>
					<Input
						id="airline"
						{...flightForm.fields.airline.as('text')}
						autocomplete="off"
						placeholder="e.g., Japan Airlines"
						value={flight.airline}
					/>
					<Field.Error />
				</Field.Field>

				<Field.Field>
					<Field.Label for="flightNumber">Flight Number</Field.Label>
					<Input
						id="flightNumber"
						{...flightForm.fields.flightNumber.as('text')}
						placeholder="e.g., JL123"
						value={flight.flightNumber ?? ''}
					/>
					<Field.Error />
				</Field.Field>
			</div>

			<div class="grid grid-cols-2 gap-2">
				<Field.Field>
					<Field.Label for="departureAirport">From</Field.Label>
					<Input
						id="departureAirport"
						{...flightForm.fields.departureAirport.as('text')}
						placeholder="e.g., NRT"
						value={flight.departureAirport}
					/>
					<Field.Error />
				</Field.Field>

				<Field.Field>
					<Field.Label for="arrivalAirport">To</Field.Label>
					<Input
						id="arrivalAirport"
						{...flightForm.fields.arrivalAirport.as('text')}
						placeholder="e.g., HND"
						value={flight.arrivalAirport}
					/>
					<Field.Error />
				</Field.Field>
			</div>

			<div class="grid grid-cols-2 gap-2">
				<Field.Field>
					<Field.Label for="departureTime">Departure</Field.Label>
					<Input
						id="departureTime"
						{...flightForm.fields.departureTime.as('text')}
						type="time"
						value={flight.departureTime ?? ''}
						class="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
					/>
					<Field.Error />
				</Field.Field>

				<Field.Field>
					<Field.Label for="arrivalTime">Arrival</Field.Label>
					<Input
						id="arrivalTime"
						{...flightForm.fields.arrivalTime.as('text')}
						type="time"
						value={flight.arrivalTime ?? ''}
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
						{...flightForm.fields.confirmationNumber.as('text')}
						placeholder="Optional"
						value={flight.confirmationNumber ?? ''}
					/>
					<Field.Error />
				</Field.Field>

				<Field.Field>
					<Field.Label for="cost">Cost</Field.Label>
					<Input
						id="cost"
						{...flightForm.fields.cost.as('number')}
						min="0"
						step="0.01"
						value={flight.cost ?? ''}
					/>
					<Field.Error />
				</Field.Field>
			</div>

			<Field.Field>
				<Field.Label for="notes">Notes</Field.Label>
				<textarea
					id="notes"
					{...flightForm.fields.notes.as('text')}
					rows="2"
					class="w-full rounded-md border p-2"
					placeholder="Any additional notes...">{flight.notes ?? ''}</textarea
				>
				<Field.Error />
			</Field.Field>

			<div class="flex justify-end gap-2">
				<Dialog.Footer>
					<Button type="submit" disabled={!!flightForm.pending}>
						{#if flightForm.pending}
							<Spinner class="size-4" />
						{:else}
							Save Changes
						{/if}
					</Button>
					<Button type="button" variant="outline" onclick={() => (open = false)}>Cancel</Button>
				</Dialog.Footer>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
