<script lang="ts">
	import Button from '$ui/button/button.svelte';
	import * as Dialog from '$ui/dialog/index.js';
	import Input from '$ui/input/input.svelte';
	import * as Field from '$ui/field';
	import { editHotel } from '$lib/remotes/hotel.remote';
	import { getTrip } from '$lib/remotes/trip.remote';
	import Spinner from '$ui/spinner/spinner.svelte';
	import type { Hotel } from '$db/schemas/itinerary';

	let {
		hotel,
		tripId,
		open = $bindable(false),
		showTrigger = true
	}: {
		hotel: Hotel;
		tripId: string;
		open?: boolean;
		showTrigger?: boolean;
	} = $props();

	const hotelForm = $derived(editHotel.for(hotel.id));

	async function onSubmitEnhance({ submit }: any) {
		try {
			await submit().updates(getTrip(tripId));
			open = false;
		} catch (e) {
			console.error('Error editing hotel', e);
		}
	}
</script>

<Dialog.Root bind:open>
	{#if showTrigger}
		<Dialog.Trigger class="flex items-center gap-2">Edit Hotel</Dialog.Trigger>
	{/if}

	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit Accommodation</Dialog.Title>
			<Dialog.Description>Update the hotel details.</Dialog.Description>
		</Dialog.Header>

		{#each hotelForm.fields.issues() as issue}
			<p class="text-sm text-red-600">{issue.message}</p>
		{/each}

		<form {...hotelForm.enhance(onSubmitEnhance)} class="space-y-3">
			<input type="hidden" name="id" value={hotel.id} />

			<Field.Field>
				<Field.Label for="name">Hotel Name</Field.Label>
				<Input
					id="name"
					{...hotelForm.fields.name.as('text')}
					autocomplete="off"
					placeholder="e.g., Grand Hyatt Tokyo"
					value={hotel.name}
				/>
				<Field.Error />
			</Field.Field>

			<Field.Field>
				<Field.Label for="address">Address</Field.Label>
				<Input
					id="address"
					{...hotelForm.fields.address.as('text')}
					placeholder="Optional address"
					value={hotel.address ?? ''}
				/>
				<Field.Error />
			</Field.Field>

			<div class="grid grid-cols-2 gap-2">
				<Field.Field>
					<Field.Label for="nights">Nights</Field.Label>
					<Input
						id="nights"
						{...hotelForm.fields.nights.as('number')}
						min="1"
						step="1"
						value={hotel.nights ?? 1}
					/>
					<Field.Error />
				</Field.Field>

				<Field.Field>
					<Field.Label for="cost">Total Cost</Field.Label>
					<Input
						id="cost"
						{...hotelForm.fields.cost.as('number')}
						min="0"
						step="0.01"
						value={hotel.cost ?? ''}
					/>
					<Field.Error />
				</Field.Field>
			</div>

			<div class="grid grid-cols-2 gap-2">
				<Field.Field>
					<Field.Label for="confirmationNumber">Confirmation #</Field.Label>
					<Input
						id="confirmationNumber"
						{...hotelForm.fields.confirmationNumber.as('text')}
						placeholder="Optional"
						value={hotel.confirmationNumber ?? ''}
					/>
					<Field.Error />
				</Field.Field>
			</div>

			<div class="flex justify-end gap-2">
				<Dialog.Footer>
					<Button type="submit" disabled={!!hotelForm.pending}>
						{#if hotelForm.pending}
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
