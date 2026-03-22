<script lang="ts">
	import * as Accordion from '$ui/accordion/index.js';
	import type { DayWithActivities } from '$db/schemas/itinerary';
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
		tripId
	}: {
		day: DayWithActivities;
		tripId: string;
	} = $props();

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
		try {
			await deleteDay({ dayId: day.id }).updates(getTrip(tripId));
		} finally {
		}
	}
</script>

<Accordion.Item value={`day-${day.id}`}>
	<Accordion.Trigger
		class="card flex items-center justify-between border px-4 py-4 text-left shadow-sm hover:border-primary"
	>
		<div class="flex-1">
			<div class="flex flex-wrap items-center gap-2">
				<span class="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
					Day {day.dayNumber}
				</span>
				<span class="text-xs text-muted-foreground">
					{day.activities.length}
					{day.activities.length === 1 ? 'activity' : 'activities'}
				</span>
				{#if day.date}
					<span class="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
						{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
					</span>
				{/if}
				{#if day.flights.length > 0}
					<span
						class="flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-700"
					>
						<Plane class="size-3" />
						{day.flights.length}
					</span>
				{/if}
				{#if day.hotels.length > 0}
					<span
						class="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700"
					>
						<Building2 class="size-3" />
						{day.hotels.length}
					</span>
				{/if}
			</div>
			<p class="mt-1 font-serif text-xl text-foreground">{day.location}</p>
			{#if day.overview}
				<p class="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{day.overview}</p>
			{/if}
		</div>
		<div class="flex items-center gap-1">
			<Button
				variant="ghost"
				size="icon"
				class="size-8"
				onclick={(e) => {
					e.stopPropagation();
					editDayOpen = true;
				}}
				aria-label="Edit day"
			>
				<Pencil class="size-3.5" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				class="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
				onclick={(e) => {
					e.stopPropagation();
					deleteDialogOpen = true;
				}}
				aria-label="Delete day"
			>
				<Trash2 class="size-3.5" />
			</Button>
		</div>
	</Accordion.Trigger>
	<Accordion.Content class="space-y-6 rounded-b-lg border-x border-b px-6 py-4">
		<!-- Flights Section - only shown when there are flights -->
		{#if day.flights.length > 0}
			<section class="space-y-3">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Plane class="size-4 text-sky-600" />
						<h2 class="font-serif text-lg">Flights</h2>
					</div>
					<Button
						variant="outline"
						size="sm"
						onclick={() => (addFlightOpen = true)}
						class="gap-1.5"
					>
						<Plus class="size-3.5" />
						Add Flight
					</Button>
				</div>
				<div class="space-y-3">
					{#each day.flights as flight (flight.id)}
						<FlightCard {flight} {tripId} />
					{/each}
				</div>
			</section>
		{/if}

		<!-- Hotels Section - only shown when there is a hotel (max 1) -->
		{#if day.hotels.length > 0}
			<section class="space-y-3">
				<div class="flex items-center gap-2">
					<Building2 class="size-4 text-amber-600" />
					<h2 class="font-serif text-lg">Accommodation</h2>
				</div>
				<HotelCard hotel={day.hotels[0]} {tripId} />
			</section>
		{/if}

		<!-- Activities Section -->
		<section class="space-y-3">
			<div class="flex items-center justify-between">
				<h2 class="font-serif text-lg">Activities</h2>
				<Button
					variant="outline"
					size="sm"
					onclick={() => (addActivityOpen = true)}
					class="gap-1.5"
				>
					<Plus class="size-3.5" />
					Add Activity
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
				<ol class="relative space-y-3">
					{#each sortedActivities as activity (activity.id)}
						<ActivityCard {activity} {tripId} />
					{/each}
				</ol>
			{/if}
		</section>

		<!-- Quick add buttons for flight/hotel when none exist -->
		{#if day.flights.length === 0 || day.hotels.length === 0}
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
				{#if day.hotels.length === 0}
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
	</Accordion.Content>
</Accordion.Item>

<!-- Dialogs rendered outside the accordion -->
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
