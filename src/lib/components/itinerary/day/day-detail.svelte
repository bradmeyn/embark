<script lang="ts">
	import type { DayWithActivities, Hotel } from '$db/schemas/itinerary';
	import { deleteDay } from '$lib/remotes/trips/day.remote';
	import { getTrip } from '$lib/remotes/trips/trip.remote';
	import AddActivityDialog from '../activity/add-activity-dialog.svelte';
	import AddHotelDialog from '../hotel/add-hotel-dialog.svelte';
	import AddFlightDialog from '../flight/add-flight-dialog.svelte';
	import EditDayDialog from './edit-day-dialog.svelte';
	import DeleteDialog from '../../delete-dialog.svelte';
	import ActivityCard from '../activity/activity-card.svelte';
	import HotelCard from '../hotel/hotel-card.svelte';
	import FlightCard from '../flight/flight-card.svelte';
	import Button from '$ui/button/button.svelte';
	import { Plus, Pencil, Trash2, Plane, Building2 } from '@lucide/svelte';

	let {
		day,
		tripId,
		activeHotels = []
	}: { day: DayWithActivities; tripId: string; activeHotels?: Hotel[] } = $props();

	let addActivityOpen = $state(false);
	let addHotelOpen = $state(false);
	let addFlightOpen = $state(false);
	let editDayOpen = $state(false);
	let deleteDialogOpen = $state(false);

	const sortedActivities = $derived(
		[...day.activities].sort((a, b) => {
			const aTime = a.time ? new Date(a.time).getTime() : Number.POSITIVE_INFINITY;
			const bTime = b.time ? new Date(b.time).getTime() : Number.POSITIVE_INFINITY;
			if (aTime === bTime) {
				const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
				const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
				return aCreated - bCreated;
			}
			return aTime - bTime;
		})
	);

	async function handleDeleteDay() {
		await deleteDay({ dayId: day.id }).updates(getTrip(tripId));
	}
</script>

<div class="space-y-6 p-6">
	<!-- Header -->
	<div class="flex items-start justify-between gap-4">
		<div class="min-w-0 flex-1">
			<div class="flex flex-wrap items-center gap-2">
				<span class="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
					Day {day.dayNumber}
				</span>
				{#if day.date}
					<span class="text-sm text-muted-foreground">
						{new Date(day.date).toLocaleDateString('en-US', {
							weekday: 'short',
							month: 'short',
							day: 'numeric'
						})}
					</span>
				{/if}
			</div>
			<h2 class="mt-1 font-serif text-2xl font-light">{day.location}</h2>
			{#if day.overview}
				<p class="mt-1 text-sm text-muted-foreground">{day.overview}</p>
			{/if}
		</div>
		<div class="flex shrink-0 items-center gap-1">
			<Button
				variant="ghost"
				size="icon"
				class="size-8"
				onclick={() => (editDayOpen = true)}
				aria-label="Edit day"
			>
				<Pencil class="size-3.5" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				class="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
				onclick={() => (deleteDialogOpen = true)}
				aria-label="Delete day"
			>
				<Trash2 class="size-3.5" />
			</Button>
		</div>
	</div>

	<!-- Flights -->
	{#if day.flights.length > 0}
		<section class="space-y-2">
			<div class="flex items-center justify-between">
				<p class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Flights</p>
				<Button
					variant="ghost"
					size="sm"
					onclick={() => (addFlightOpen = true)}
					class="h-7 gap-1 px-2 text-xs"
				>
					<Plus class="size-3" />
					Add
				</Button>
			</div>
			<div class="space-y-3">
				{#each day.flights as flight (flight.id)}
					<FlightCard {flight} {tripId} />
				{/each}
			</div>
		</section>
	{/if}

	<!-- Hotels -->
	{#if activeHotels.length > 0}
		{#each activeHotels as hotel (hotel.id)}
			<HotelCard {hotel} {tripId} />
		{/each}
	{/if}

	<!-- Activities -->
	<section class="space-y-2">
		<div class="flex items-center justify-between">
			<p class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Activities</p>
			<Button
				variant="ghost"
				size="sm"
				onclick={() => (addActivityOpen = true)}
				class="h-7 gap-1 px-2 text-xs"
			>
				<Plus class="size-3" />
				Add
			</Button>
		</div>

		{#if sortedActivities.length === 0}
			<div
				class="rounded-lg border border-dashed border-primary/30 bg-primary/5 px-4 py-6 text-center"
			>
				<p class="text-sm font-medium text-primary/60">No activities yet</p>
				<p class="mt-1 text-xs text-muted-foreground">
					Add your first activity to start shaping this day.
				</p>
			</div>
		{:else}
			<ol>
				{#each sortedActivities as activity (activity.id)}
					<ActivityCard {activity} {tripId} />
				{/each}
			</ol>
		{/if}
	</section>

	<!-- Quick add flight/hotel -->
	{#if day.flights.length === 0 || activeHotels.length === 0}
		<div class="flex flex-wrap gap-2 border-t pt-4">
			{#if day.flights.length === 0}
				<Button
					variant="ghost"
					size="sm"
					onclick={() => (addFlightOpen = true)}
					class="gap-1.5 text-sky-600 hover:bg-sky-50 hover:text-sky-700"
				>
					<Plane class="size-3.5" />
					Add Flight
				</Button>
			{/if}
			{#if day.hotels.length === 0 && activeHotels.length === 0}
				<Button
					variant="ghost"
					size="sm"
					onclick={() => (addHotelOpen = true)}
					class="gap-1.5 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
				>
					<Building2 class="size-3.5" />
					Add Accommodation
				</Button>
			{/if}
		</div>
	{/if}
</div>

<AddActivityDialog dayId={day.id} {tripId} bind:open={addActivityOpen} showTrigger={false} />
<AddHotelDialog dayId={day.id} {tripId} bind:open={addHotelOpen} showTrigger={false} />
<AddFlightDialog dayId={day.id} {tripId} bind:open={addFlightOpen} showTrigger={false} />
<EditDayDialog {day} {tripId} bind:open={editDayOpen} showTrigger={false} />
<DeleteDialog
	label="day"
	onDelete={handleDeleteDay}
	bind:open={deleteDialogOpen}
	showTrigger={false}
/>
