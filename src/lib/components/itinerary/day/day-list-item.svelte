<script lang="ts">
	import type { DayWithActivities, TravelSegment } from '$db/schemas/itinerary';
	import {
		Plane,
		Car,
		TrainFront,
		Bus,
		Ship,
		Bike,
		PersonStanding,
		HelpCircle
	} from '@lucide/svelte';

	let {
		day,
		active,
		outgoingSegment = null
	}: {
		day: DayWithActivities;
		active: boolean;
		outgoingSegment?: TravelSegment | null;
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

	const TravelIcon = $derived(
		outgoingSegment
			? (MODE_ICONS[outgoingSegment.mode as keyof typeof MODE_ICONS] ?? HelpCircle)
			: null
	);
</script>

<div class="rounded-md px-2 py-1 transition-colors {active ? 'bg-primary/5' : 'hover:bg-muted/60'}">
	<div class="flex items-center justify-between gap-1">
		<p class="truncate text-xs font-medium {active ? 'text-primary' : 'text-foreground'}">
			{day.location}
		</p>

		<div class="flex shrink-0 items-center gap-1">
			{#if day.flights.length > 0}
				<span class="flex items-center gap-0.5 text-xs text-sky-600">
					<Plane class="size-3" />
				</span>
			{/if}
			{#if TravelIcon}
				<span class="text-muted-foreground" title="Onward travel: {outgoingSegment?.mode}">
					<TravelIcon class="size-3" />
				</span>
			{/if}
		</div>
	</div>
	<p class="mt-0.5 text-[11px] text-muted-foreground">
		{#if day.date}
			{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
		{/if}
		<span class="text-muted-foreground/50">{day.activities.length} activities</span>
	</p>
</div>
