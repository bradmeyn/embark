<script lang="ts">
	import DayListItem from '$lib/components/itinerary/day/day-list-item.svelte';
	import type { DayWithActivities, TravelSegment } from '$db/schemas/itinerary';

	let {
		days,
		travelSegments,
		tripId,
		selectedDayId,
		onSelectDay
	}: {
		days: DayWithActivities[];
		travelSegments: TravelSegment[];
		tripId: string;
		selectedDayId: string | null;
		onSelectDay: (id: string) => void;
	} = $props();
</script>

<div class="flex w-52 shrink-0 flex-col border-r">
	<div class="flex-1 overflow-y-auto px-2 py-3">
		{#each days as day, i (day.id)}
			{@const hasNext = i < days.length - 1}
			{@const outgoingSegment = travelSegments.find((s) => s.fromDayId === day.id) ?? null}

			<div class="flex gap-2">
				<!-- Timeline column: numbered dot + connecting line -->
				<div class="flex w-5 shrink-0 flex-col items-center">
					<div
						class="z-10 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-background transition-colors {selectedDayId ===
						day.id
							? 'bg-primary text-primary-foreground'
							: 'bg-muted text-muted-foreground'}"
					>
						{day.dayNumber}
					</div>
					{#if hasNext}
						<div class="mt-1 w-px flex-1 bg-border"></div>
					{/if}
				</div>

				<!-- Content column: day item only -->
				<div class="min-w-0 flex-1 {hasNext ? 'pb-3' : ''}">
					<button onclick={() => onSelectDay(day.id)} class="w-full text-left">
						<DayListItem {day} active={selectedDayId === day.id} {outgoingSegment} />
					</button>
				</div>
			</div>
		{/each}
	</div>
</div>
