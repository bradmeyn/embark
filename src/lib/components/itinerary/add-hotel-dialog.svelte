<script lang="ts">
	import Button, { buttonVariants } from '$ui/button/button.svelte';
	import * as Dialog from '$ui/dialog/index.js';
	import Input from '$ui/input/input.svelte';
	import * as Field from '$ui/field';
	import { addHotel } from '$lib/remotes/hotel.remote';
	import { getItinerary } from '$lib/remotes/itinerary.remote';
	import Spinner from '$ui/spinner/spinner.svelte';
	import { Plus } from '@lucide/svelte';

	let {
		dayId,
		itineraryId,
		open = $bindable(false),
		showTrigger = true
	}: {
		dayId: string;
		itineraryId: string;
		open?: boolean;
		showTrigger?: boolean;
	} = $props();

	async function onSubmitEnhance({ form, submit }: any) {
		try {
			await submit().updates(getItinerary(itineraryId));
			form.reset();
			if (addHotel.result?.success) {
				open = false;
			}
		} catch (e) {
			console.error('Error adding hotel', e);
		}
	}
</script>

<Dialog.Root bind:open>
	{#if showTrigger}
		<Dialog.Trigger
			class={buttonVariants({ variant: 'outline', size: 'sm' })}
			aria-label="Add hotel"
		>
			<Plus class="mr-1.5 size-3.5" />
			Add Hotel
		</Dialog.Trigger>
	{/if}

	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add Accommodation</Dialog.Title>
			<Dialog.Description>Add hotel or accommodation details for this day.</Dialog.Description>
		</Dialog.Header>

		{#each addHotel.fields.issues() as issue}
			<p class="text-sm text-red-600">{issue.message}</p>
		{/each}

		<form {...addHotel.for(dayId).enhance(onSubmitEnhance)} class="space-y-3">
			<Field.Field>
				<Field.Label for="name">Hotel Name</Field.Label>
				<Input
					id="name"
					{...addHotel.fields.name.as('text')}
					autocomplete="off"
					placeholder="e.g., Grand Hyatt Tokyo"
				/>
				<Field.Error />
			</Field.Field>

			<Field.Field>
				<Field.Label for="address">Address</Field.Label>
				<Input
					id="address"
					{...addHotel.fields.address.as('text')}
					placeholder="Optional address"
				/>
				<Field.Error />
			</Field.Field>

			<div class="grid grid-cols-2 gap-2">
				<Field.Field>
					<Field.Label for="confirmationNumber">Confirmation #</Field.Label>
					<Input
						id="confirmationNumber"
						{...addHotel.fields.confirmationNumber.as('text')}
						placeholder="Optional"
					/>
					<Field.Error />
				</Field.Field>

				<Field.Field>
					<Field.Label for="cost">Cost</Field.Label>
					<Input id="cost" {...addHotel.fields.cost.as('number')} min="0" step="0.01" />
					<Field.Error />
				</Field.Field>
			</div>

			<Field.Field>
				<Field.Label for="notes">Notes</Field.Label>
				<textarea
					id="notes"
					{...addHotel.fields.notes.as('text')}
					rows="2"
					class="w-full rounded-md border p-2"
					placeholder="Any additional notes..."
				></textarea>
				<Field.Error />
			</Field.Field>

			<input type="hidden" name="dayId" value={dayId} />

			<div class="mt-4 flex justify-end">
				<Dialog.Footer>
					<Button type="submit" disabled={!!addHotel.pending}>
						{#if addHotel.pending}
							<Spinner class="size-4" />
						{:else}
							Add Hotel
						{/if}
					</Button>
				</Dialog.Footer>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
