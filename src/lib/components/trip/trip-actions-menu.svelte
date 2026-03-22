<script lang="ts">
	import * as DropdownMenu from '$ui/dropdown-menu/index.js';
	import { buttonVariants } from '$ui/button';
	import { EllipsisVertical, Pencil, Trash2, Share2 } from '@lucide/svelte';

	import DeleteDialog from '$lib/components/delete-dialog.svelte';
	import EditTripDialog from '$lib/components/trip/edit-trip-dialog.svelte';
	import ShareDialog from '$lib/components/trip/share-dialog.svelte';
	import type { TripWithBasicDays } from '$db/schemas/itinerary';
	import { deleteTrip } from '$lib/remotes/trips/trip.remote';

	let { trip }: { trip: TripWithBasicDays } = $props();

	let menuOpen = $state(false);
	let editTripOpen = $state(false);
	let deleteOpen = $state(false);
	let shareOpen = $state(false);

	async function handleDeleteTrip() {
		try {
			await deleteTrip({ id: trip.id });
		} finally {
			deleteOpen = false;
		}
	}
</script>

<DropdownMenu.Root bind:open={menuOpen}>
	<DropdownMenu.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
		<EllipsisVertical class="size-5" />
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Trip Menu</DropdownMenu.Label>
			<DropdownMenu.Item
				onclick={() => {
					menuOpen = false;
					editTripOpen = true;
				}}
			>
				<Pencil class="size-4" />
				<span>Edit Trip</span>
			</DropdownMenu.Item>
			<DropdownMenu.Item
				onclick={() => {
					menuOpen = false;
					shareOpen = true;
				}}
			>
				<Share2 class="size-4" />
				<span>Share & Collaborate</span>
			</DropdownMenu.Item>
			<DropdownMenu.Separator />
			<DropdownMenu.Item
				onclick={() => {
					menuOpen = false;
					deleteOpen = true;
				}}
			>
				<Trash2 class="size-4" />
				<span>Delete Trip</span>
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<!-- Dialogs rendered outside the menu -->
<EditTripDialog {trip} bind:open={editTripOpen} showTrigger={false} />
<ShareDialog {trip} bind:open={shareOpen} showTrigger={false} />
<DeleteDialog label="trip" onDelete={handleDeleteTrip} bind:open={deleteOpen} showTrigger={false} />
