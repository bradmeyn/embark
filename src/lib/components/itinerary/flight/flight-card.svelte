<script lang="ts">
	import type { Flight } from '$db/schemas/itinerary';
	import { deleteFlight } from '$lib/remotes/trips/flight.remote';
	import { DollarSign, Pencil, Trash2, Hash, ArrowRight } from '@lucide/svelte';
	import DeleteDialog from '../../delete-dialog.svelte';
	import EditFlightDialog from './edit-flight-dialog.svelte';
	import { getTrip } from '$lib/remotes/trips/trip.remote';
	import Button from '$ui/button/button.svelte';

	let {
		flight,
		tripId
	}: {
		flight: Flight;
		tripId: string;
	} = $props();

	let deleteDialogOpen = $state(false);
	let editDialogOpen = $state(false);

	async function handleDeleteFlight() {
		try {
			await deleteFlight({ flightId: flight.id }).updates(getTrip(tripId));
		} finally {
		}
	}
</script>

<div class="flex items-start justify-between py-3">
	<div>
		<h3 class="font-medium text-foreground">
			{flight.airline}
			{#if flight.flightNumber}
				<span class="font-normal text-muted-foreground">({flight.flightNumber})</span>
			{/if}
		</h3>

		<div class="mt-1 flex items-center gap-2 text-sm">
			<span class="font-medium">{flight.departureAirport}</span>
			{#if flight.departureTime}
				<span class="text-muted-foreground">{flight.departureTime}</span>
			{/if}
			<ArrowRight class="size-4 text-muted-foreground" />
			<span class="font-medium">{flight.arrivalAirport}</span>
			{#if flight.arrivalTime}
				<span class="text-muted-foreground">{flight.arrivalTime}</span>
			{/if}
		</div>

		<div class="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
			{#if flight.confirmationNumber}
				<div class="flex items-center gap-1 rounded-full border px-2.5 py-1">
					<Hash class="size-3 text-primary" />
					<span>{flight.confirmationNumber}</span>
				</div>
			{/if}
			{#if flight.cost}
				<div class="flex items-center gap-1 rounded-full border px-2.5 py-1">
					<DollarSign class="size-3 text-primary" />
					<span>{flight.cost}</span>
				</div>
			{/if}
		</div>

		{#if flight.notes}
			<p class="mt-2 text-sm text-muted-foreground">{flight.notes}</p>
		{/if}
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

<EditFlightDialog {flight} {tripId} bind:open={editDialogOpen} showTrigger={false} />
<DeleteDialog
	label="flight"
	onDelete={handleDeleteFlight}
	bind:open={deleteDialogOpen}
	showTrigger={false}
/>
