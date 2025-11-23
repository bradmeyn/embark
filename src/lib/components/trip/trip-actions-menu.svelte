<script lang="ts">
	import * as DropdownMenu from '$ui/dropdown-menu/index.js';
	import { EllipsisVertical } from '@lucide/svelte';
	import Button from '$ui/button/button.svelte';

	import DeleteDialog from '$lib/components/delete-dialog.svelte';
	import AddItineraryDialog from '$lib/components/itinerary/add-itinerary-dialog.svelte';
	import EditTripDialog from '$lib/components/trip/edit-trip-dialog.svelte';
	import type { TripWithItineraries } from '$db/schemas/itinerary';

	let { trip }: { trip: TripWithItineraries } = $props();

	const onclick = (e: Event) => e.preventDefault();

	let open = $state(false);
</script>

<DropdownMenu.Root bind:open>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon"><EllipsisVertical class="size-5" /></Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Trip Menu</DropdownMenu.Label>
			<DropdownMenu.Item {onclick}><AddItineraryDialog tripId={trip.id} /></DropdownMenu.Item>
			<DropdownMenu.Item {onclick}><EditTripDialog {trip} /></DropdownMenu.Item>
			<DropdownMenu.Separator />
			<DropdownMenu.Item>
				<DeleteDialog label={'trip'} onDelete={() => {}} />
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
