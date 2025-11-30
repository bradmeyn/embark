<script lang="ts">
	import * as Accordion from '$ui/accordion/index.js';
	import type { DayWithActivities } from '$db/schemas/itinerary';
	import { deleteDay } from '$lib/remotes/day.remote';
	import { getItinerary } from '$lib/remotes/itinerary.remote';
	import AddActivityDialog from './add-activity-dialog.svelte';
	import EditDayDialog from './edit-day-dialog.svelte';
	import DeleteDialog from '../delete-dialog.svelte';
	import ActivityCard from './activity-card.svelte';
	import Button from '$ui/button/button.svelte';
	import { Plus, Pencil, Trash2 } from '@lucide/svelte';

	let {
		day,
		itineraryId
	}: {
		day: DayWithActivities;
		itineraryId: string;
	} = $props();

	let addActivityOpen = $state(false);
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
			await deleteDay({ dayId: day.id }).updates(getItinerary(itineraryId));
		} finally {
		}
	}
</script>

<Accordion.Item value={`day-${day.id}`}>
	<Accordion.Trigger
		class="card flex items-center justify-between border px-4 py-4 text-left shadow-sm hover:border-primary"
	>
		<div class="flex-1">
			<div class="flex items-center gap-2">
				<span class="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
					Day {day.dayNumber}
				</span>
				<span class="text-xs text-muted-foreground">
					{day.activities.length}
					{day.activities.length === 1 ? 'activity' : 'activities'}
				</span>
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
		<section class="space-y-4">
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
		</section>
	</Accordion.Content>
</Accordion.Item>

<!-- Dialogs rendered outside the accordion -->
<AddActivityDialog dayId={day.id} {itineraryId} bind:open={addActivityOpen} showTrigger={false} />
<EditDayDialog {day} {itineraryId} bind:open={editDayOpen} showTrigger={false} />
<DeleteDialog
	label="day"
	onDelete={handleDeleteDay}
	bind:open={deleteDialogOpen}
	showTrigger={false}
/>
