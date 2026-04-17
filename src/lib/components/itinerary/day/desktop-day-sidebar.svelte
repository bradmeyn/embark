<script lang="ts">
	import DayListItem from '$lib/components/itinerary/day/day-list-item.svelte';
	import ItineraryMap from '$lib/components/itinerary/itinerary-map.svelte';
	import type { DayWithActivities, TravelSegment } from '$db/schemas/itinerary';
	import * as Dialog from '$ui/dialog/index.js';

	let {
		days,
		travelSegments,
		selectedDayId,
		onSelectDay
	}: {
		days: DayWithActivities[];
		travelSegments: TravelSegment[];
		selectedDayId: string | null;
		onSelectDay: (id: string) => void;
	} = $props();

	const hasMap = $derived(days.some((d) => d.latitude != null));
	const mapKey = $derived(
		[
			...days.map((d) => `${d.id}:${d.latitude}:${d.longitude}`),
			...travelSegments.map((s) => `${s.id}:${s.routeGeometry?.length ?? 0}`)
		].join(',')
	);
</script>

<div class="flex w-64 shrink-0 flex-col border-r">
	{#if hasMap}
		<div class="shrink-0 p-2 pb-0">
			<Dialog.Root>
				<Dialog.Trigger class="group relative block w-full overflow-hidden rounded-lg">
					{#key mapKey}
						<ItineraryMap {days} {travelSegments} interactive={false} class="h-28 rounded-lg" />
					{/key}
					<div
						class="absolute inset-0 flex items-end justify-center bg-black/0 pb-2 transition-colors group-hover:bg-black/10"
					>
						<span
							class="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm"
						>
							Show full map
						</span>
					</div>
				</Dialog.Trigger>
				<Dialog.Content class="gap-0 overflow-hidden p-0 sm:max-w-2xl">
					<Dialog.Header class="px-4 pt-4 pb-3">
						<Dialog.Title>Trip Map</Dialog.Title>
					</Dialog.Header>
					{#key mapKey}
						<ItineraryMap {days} {travelSegments} class="h-96 rounded-none" />
					{/key}
				</Dialog.Content>
			</Dialog.Root>
		</div>
	{/if}

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
