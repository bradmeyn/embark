<script lang="ts">
	import Button from '$ui/button/button.svelte';
	import * as Dialog from '$ui/dialog/index.js';
	import Input from '$ui/input/input.svelte';
	import * as Field from '$ui/field';
	import { editTrip, getTrips } from '$lib/remotes/trip.remote';
	import Spinner from '$ui/spinner/spinner.svelte';
	import { Pencil } from '@lucide/svelte';
	import type { TripWithItineraries } from '$db/schemas/itinerary';

	let { trip }: { trip: TripWithItineraries } = $props();

	let isOpen = $state(false);
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Trigger class="flex items-center gap-2">
		{#snippet child({ props })}
			<Pencil class="size-4" />
			<span>Edit Trip</span>
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit Trip</Dialog.Title>
		</Dialog.Header>

		<form
			{...editTrip.enhance(async ({ submit, data }) => {
				try {
					await submit().updates(getTrips());

					if (editTrip.result) {
						isOpen = false;
					} else {
						alert('Failed to update trip.');
					}
				} catch (error) {
					console.error('Error creating trip:', error);
				}
			})}
		>
			<input type="hidden" name="id" value={trip.id} />
			<Field.Field>
				<Field.Label for="name">Trip Name</Field.Label>
				<Input
					id="name"
					{...editTrip.fields.name.as('text')}
					autocomplete="off"
					placeholder="Japan 2025"
					value={trip.name}
					disabled={!!editTrip.pending}
				/>
				<Field.Error />
				{#each editTrip.fields.name.issues() as issue}
					<Field.Error>{issue.message}</Field.Error>
				{/each}
			</Field.Field>

			<div class="mt-4 flex justify-end">
				<Dialog.Footer>
					<Button type="submit" disabled={!!editTrip.pending}>
						{#if !!editTrip.pending}
							<Spinner class="size-4" />
						{:else}
							Update Trip
						{/if}
					</Button>
					<Button type="button" variant="outline" onclick={() => (isOpen = false)}>Cancel</Button>
				</Dialog.Footer>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
