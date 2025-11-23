<script lang="ts">
	import * as Accordion from '$ui/accordion/index.js';
	import type { DayWithActivities } from '$db/schemas/itinerary';
	import { deleteDay } from '$lib/remotes/day.remote';
	import { getItinerary } from '$lib/remotes/itinerary.remote';
	import AddActivityDialog from './add-activity-dialog.svelte';
	import DeleteDialog from '../delete-dialog.svelte';
	import ActivityCard from './activity-card.svelte';

	let {
		day,
		itineraryId
	}: {
		day: DayWithActivities;
		itineraryId: string;
	} = $props();

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
			await deleteDay({ dayId: day.id }).updates(getItinerary(itineraryId));
		} finally {
		}
	}
</script>

<Accordion.Item value={`day-${day.id}`}>
	<Accordion.Trigger class="card flex items-center justify-between px-4 py-4 text-left shadow-sm">
		<div>
			<p class="text-xs tracking-wide text-muted-foreground uppercase">Day {day.dayNumber}</p>
			<p class="font-serif text-xl text-foreground">{day.location}</p>
			<p class="text-sm text-muted-foreground">{day.activities.length} activities</p>
		</div>
	</Accordion.Trigger>
	<Accordion.Content class="space-y-6 border px-6 py-4">
		<section class="space-y-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center justify-between gap-2">
					<h2 class="font-serif text-lg">Activities</h2>
					<AddActivityDialog dayId={day.id} {itineraryId} />
				</div>
			</div>

			{#if sortedActivities.length === 0}
				<div
					class="rounded-lg border border-dashed border-primary/20 bg-primary/5 p-6 text-center text-sm text-muted-foreground"
				>
					Add your first activity to start shaping this day.
				</div>
			{:else}
				<ol class="relative space-y-4">
					{#each sortedActivities as activity}
						<ActivityCard {activity} {itineraryId} />
					{/each}
				</ol>
			{/if}
			<div class="flex items-center justify-center gap-2">
				<DeleteDialog label={`day`} onDelete={handleDeleteDay} />
			</div>
		</section>
	</Accordion.Content>
</Accordion.Item>
