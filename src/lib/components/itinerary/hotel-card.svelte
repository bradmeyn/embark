<script lang="ts">
	import type { Hotel } from '$db/schemas/itinerary';
	import { deleteHotel } from '$lib/remotes/trips/hotel.remote';
	import { Building2, MapPin, Pencil, Trash2, Hash } from '@lucide/svelte';
	import DeleteDialog from '../delete-dialog.svelte';
	import EditHotelDialog from './edit-hotel-dialog.svelte';
	import { getTrip } from '$lib/remotes/trips/trip.remote';
	import Button from '$ui/button/button.svelte';

	let {
		hotel,
		tripId
	}: {
		hotel: Hotel;
		tripId: string;
	} = $props();

	let deleteDialogOpen = $state(false);
	let editDialogOpen = $state(false);

	async function handleDeleteHotel() {
		try {
			await deleteHotel({ hotelId: hotel.id }).updates(getTrip(tripId));
		} finally {
		}
	}
</script>

<div class="flex items-start justify-between py-2">
	<div class="flex min-w-0 flex-1 gap-2">
		<Building2 class="mt-0.5 size-4 shrink-0 text-amber-500" />
		<div class="min-w-0">
			<h3 class="font-medium text-foreground">{hotel.name}</h3>

			<div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
				<span
					>{hotel.nights ?? 1}
					{(hotel.nights ?? 1) === 1 ? 'night' : 'nights'}{#if hotel.cost}&nbsp;&middot;&nbsp;${(
							Number(hotel.cost) / (hotel.nights ?? 1)
						).toFixed(0)}/night{/if}</span
				>
				{#if hotel.address}
					<div class="flex items-center gap-1">
						<MapPin class="size-3 text-primary" />
						<span>{hotel.address}</span>
					</div>
				{/if}
				{#if hotel.confirmationNumber}
					<div class="flex items-center gap-1">
						<Hash class="size-3 text-primary" />
						<span>{hotel.confirmationNumber}</span>
					</div>
				{/if}
			</div>

			{#if hotel.notes}
				<p class="mt-1 text-xs text-muted-foreground">{hotel.notes}</p>
			{/if}
		</div>
	</div>
	<div class="flex shrink-0 gap-1">
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

<EditHotelDialog {hotel} {tripId} bind:open={editDialogOpen} showTrigger={false} />
<DeleteDialog
	label="hotel"
	onDelete={handleDeleteHotel}
	bind:open={deleteDialogOpen}
	showTrigger={false}
/>
