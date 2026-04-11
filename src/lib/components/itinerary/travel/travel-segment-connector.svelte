<script lang="ts">
	import type { TravelSegment, DayWithActivities } from '$db/schemas/itinerary';
	import AddTravelSegmentDialog from './add-travel-segment-dialog.svelte';
	import EditTravelSegmentDialog from './edit-travel-segment-dialog.svelte';
	import {
		Car,
		TrainFront,
		Bus,
		Ship,
		Bike,
		PersonStanding,
		HelpCircle,
		Plus
	} from '@lucide/svelte';

	let {
		segment,
		fromDay,
		tripId
	}: {
		segment: TravelSegment | null | undefined;
		fromDay: DayWithActivities;
		tripId: string;
	} = $props();

	const MODE_ICONS = {
		car: Car,
		train: TrainFront,
		bus: Bus,
		ferry: Ship,
		walk: PersonStanding,
		bike: Bike,
		other: HelpCircle
	} as const;

	let addOpen = $state(false);
	let editOpen = $state(false);

	const ModeIcon = $derived(
		segment ? (MODE_ICONS[segment.mode as keyof typeof MODE_ICONS] ?? HelpCircle) : null
	);
</script>

<div class="group flex items-center">
	{#if segment}
		<!-- Show existing segment as a clickable chip -->
		<button
			onclick={() => (editOpen = true)}
			class="flex items-center gap-1.5 rounded-full border bg-background px-2 py-0.5 text-[11px] text-muted-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
		>
			{#if ModeIcon}
				<ModeIcon class="size-3" />
			{/if}
			<span class="capitalize">{segment.mode}</span>
			{#if segment.departureTime && segment.arrivalTime}
				<span class="text-muted-foreground/60">·</span>
				<span>{segment.departureTime}–{segment.arrivalTime}</span>
			{/if}
		</button>

		<EditTravelSegmentDialog {segment} {tripId} bind:open={editOpen} showTrigger={false} />
	{:else}
		<!-- Show a faint add button on group hover -->
		<button
			onclick={() => (addOpen = true)}
			class="flex items-center gap-1 rounded-full border border-dashed border-transparent px-2 py-0.5 text-[11px] text-transparent transition-colors group-hover:border-border group-hover:text-muted-foreground hover:border-primary! hover:text-primary!"
			aria-label="Add travel segment"
		>
			<Plus class="size-3" />
			Travel
		</button>

		<AddTravelSegmentDialog
			fromDayId={fromDay.id}
			{tripId}
			bind:open={addOpen}
			showTrigger={false}
		/>
	{/if}
</div>
