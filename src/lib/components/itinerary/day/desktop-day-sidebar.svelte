<script lang="ts">
	import DayListItem from '$lib/components/itinerary/day/day-list-item.svelte';
	import TravelSegmentConnector from '$lib/components/itinerary/travel/travel-segment-connector.svelte';
	import { Plus } from '@lucide/svelte';
	import type { DayWithActivities, TravelSegment } from '$db/schemas/itinerary';

	let {
		days,
		travelSegments,
		tripId,
		selectedDayId = $bindable(),
		onInsertDay
	}: {
		days: DayWithActivities[];
		travelSegments: TravelSegment[];
		tripId: string;
		selectedDayId: string | null;
		onInsertDay: (atPosition: number) => void;
	} = $props();
</script>

<div class="flex w-48 shrink-0 flex-col border-r print:hidden">
	<div class="flex-1 space-y-0 overflow-y-auto p-1.5">
		{#each days as day, i (day.id)}
			<button onclick={() => (selectedDayId = day.id)} class="w-full text-left">
				<DayListItem {day} active={selectedDayId === day.id} />
			</button>
			{#if i < days.length - 1}
				{@const nextDay = days[i + 1]}
				{@const segment = travelSegments.find((s) => s.fromDayId === day.id)}
				<div class="group relative flex items-center">
					<div class="flex-1">
						<TravelSegmentConnector {segment} fromDay={day} {tripId} />
					</div>
					<button
						onclick={() => onInsertDay(nextDay.dayNumber)}
						class="mr-1 flex size-5 shrink-0 items-center justify-center rounded-full border border-dashed border-transparent text-transparent transition-colors group-hover:border-border group-hover:text-muted-foreground hover:border-primary! hover:text-primary!"
						aria-label="Insert day"
						title="Insert day here"
					>
						<Plus class="size-3" />
					</button>
				</div>
			{/if}
		{/each}
	</div>
</div>
