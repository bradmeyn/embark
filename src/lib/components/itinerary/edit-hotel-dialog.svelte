<script lang="ts">
	import Button from '$ui/button/button.svelte';
	import * as Dialog from '$ui/dialog/index.js';
	import Input from '$ui/input/input.svelte';
	import * as Field from '$ui/field';
	import { editHotel } from '$lib/remotes/hotel.remote';
	import { getItinerary } from '$lib/remotes/itinerary.remote';
	import Spinner from '$ui/spinner/spinner.svelte';
	import type { Hotel } from '$db/schemas/itinerary';

	let {
		hotel,
		itineraryId,
		open = $bindable(false),
		showTrigger = true
	}: {
		hotel: Hotel;
		itineraryId: string;
		open?: boolean;
		showTrigger?: boolean;
	} = $props();

	const hotelForm = $derived(editHotel.for(hotel.id));

	async function onSubmitEnhance({ submit }: any) {
		try {
			await submit().updates(getItinerary(itineraryId));
			if (hotelForm.result?.success) {
				open = false;
			}
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
					<Field.Label for="confirmationNumber">Confirmation #</Field.Label>
					<Input
						id="confirmationNumber"
						{...hotelForm.fields.confirmationNumber.as('text')}
						placeholder="Optional"
						value={hotel.confirmationNumber ?? ''}
					/>
					<Field.Error />
				</Field.Field>

				<Field.Field>
					<Field.Label for="cost">Cost</Field.Label>
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

			<Field.Field>
				<Field.Label for="notes">Notes</Field.Label>
				<textarea
					id="notes"
					{...hotelForm.fields.notes.as('text')}
					rows="2"
					class="w-full rounded-md border p-2"
					placeholder="Any additional notes...">{hotel.notes ?? ''}</textarea
				>
				<Field.Error />
			</Field.Field>

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
