<script lang="ts">
	import ItineraryMap from '$lib/components/itinerary/itinerary-map.svelte';
	import type { DayWithActivities, TravelSegment } from '$db/schemas/itinerary';
	import type { LocationGroup } from '$lib/utils';

	let {
		days,
		travelSegments,
		locationGroups,
		tripTotal,
		mapClass = 'h-60 rounded-lg',
		showStats = false
	}: {
		days: DayWithActivities[];
		travelSegments: TravelSegment[];
		locationGroups: LocationGroup[];
		tripTotal?: number;
		mapClass?: string;
		showStats?: boolean;
	} = $props();

	const hasMap = $derived(days.some((d) => d.latitude != null));
	const mapKey = $derived(
		[
			...days.map((d) => `${d.id}:${d.latitude}:${d.longitude}`),
			...travelSegments.map((s) => `${s.id}:${s.routeGeometry?.length ?? 0}`)
		].join(',')
	);
</script>

<div class="rounded-xl border bg-card shadow-sm">
	{#if hasMap}
		<div class="p-3 pb-0">
			{#key mapKey}
				<ItineraryMap {days} {travelSegments} class={mapClass} />
			{/key}
		</div>
	{/if}

	<div class="scrollbar-none flex items-center gap-2 overflow-x-auto p-3">
		{#each locationGroups as group, i (group.location)}
			<div class="flex shrink-0 items-center gap-2">
				<span
					class="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary"
				>
					{i + 1}
				</span>
				<div>
					<p class="font-serif text-sm leading-tight">{group.location}</p>
					<p class="text-xs text-muted-foreground">
						{group.days}
						{group.days === 1 ? 'night' : 'nights'}
					</p>
				</div>
				{#if i < locationGroups.length - 1}
					<span class="ml-1 text-muted-foreground/40">→</span>
				{/if}
			</div>
		{/each}
		{#if showStats}
			<div class="ml-auto flex shrink-0 items-center gap-3 pl-3 text-xs text-muted-foreground">
				<span>{days.length} {days.length === 1 ? 'day' : 'days'}</span>
				{#if tripTotal && tripTotal > 0}
					<span class="font-medium text-foreground">${tripTotal.toFixed(2)} total</span>
				{/if}
			</div>
		{/if}
	</div>
</div>
