<script lang="ts">
	import type { Hotel } from '$db/schemas/itinerary';
	import { deleteHotel } from '$lib/remotes/hotel.remote';
	import { Building2, DollarSign, MapPin, Pencil, Trash2, Hash } from '@lucide/svelte';
	import DeleteDialog from '../delete-dialog.svelte';
	import EditHotelDialog from './edit-hotel-dialog.svelte';
	import { getItinerary } from '$lib/remotes/itinerary.remote';
	import Button from '$ui/button/button.svelte';

	let {
		hotel,
		itineraryId
	}: {
		hotel: Hotel;
		itineraryId: string;
	} = $props();

	let deleteDialogOpen = $state(false);
	let editDialogOpen = $state(false);

	async function handleDeleteHotel() {
		try {
			await deleteHotel({ hotelId: hotel.id }).updates(getItinerary(itineraryId));
		} finally {
		}
	}
</script>

<div class="card flex items-start justify-between p-4 shadow-sm">
	<div class="flex gap-3">
		<div
			class="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600"
		>
			<Building2 class="size-5" />
		</div>
		<div>
			<p class="text-xs font-semibold tracking-wide text-amber-600 uppercase">Accommodation</p>
			<h3 class="text-lg font-semibold text-foreground">{hotel.name}</h3>

			<div class="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
				{#if hotel.address}
					<div class="flex items-center gap-1 rounded-full border px-2.5 py-1">
						<MapPin class="size-3 text-primary" />
						<span>{hotel.address}</span>
					</div>
				{/if}
				{#if hotel.confirmationNumber}
					<div class="flex items-center gap-1 rounded-full border px-2.5 py-1">
						<Hash class="size-3 text-primary" />
						<span>{hotel.confirmationNumber}</span>
					</div>
				{/if}
				{#if hotel.cost}
					<div class="flex items-center gap-1 rounded-full border px-2.5 py-1">
						<DollarSign class="size-3 text-primary" />
						<span>{hotel.cost}</span>
					</div>
				{/if}
			</div>

			{#if hotel.notes}
				<p class="mt-2 text-sm text-muted-foreground">{hotel.notes}</p>
			{/if}
		</div>
	</div>
	<div class="flex gap-1">
		<Button variant="ghost" size="icon" class="size-8" onclick={() => (editDialogOpen = true)}>
			<Pencil class="size-3.5" />
		</Button>
		<Button
			variant="ghost"
			size="icon"
			class="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
			onclick={() => (deleteDialogOpen = true)}
		>
			<Trash2 class="size-3.5" />
		</Button>
	</div>
</div>

<EditHotelDialog {hotel} {itineraryId} bind:open={editDialogOpen} showTrigger={false} />
<DeleteDialog
	label="hotel"
	onDelete={handleDeleteHotel}
	bind:open={deleteDialogOpen}
	showTrigger={false}
/>
