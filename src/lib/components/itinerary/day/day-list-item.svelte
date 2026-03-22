<script lang="ts">
	import type { DayWithActivities } from '$db/schemas/itinerary';
	import { Plane } from '@lucide/svelte';

	let { day, active }: { day: DayWithActivities; active: boolean } = $props();
</script>

<div
	class="rounded-md px-2 py-1.5 transition-colors {active
		? 'border-l-2 border-primary bg-primary/5'
		: 'hover:bg-muted/60'}"
>
	<div class="flex items-center justify-between gap-2">
		<p class="truncate text-xs font-medium text-foreground">
			<span class="text-primary">Day {day.dayNumber}</span>
			<span class="mx-1 text-muted-foreground">-</span>
			<span>{day.location}</span>
		</p>

		{#if day.flights.length > 0}
			<span class="flex items-center gap-0.5 text-xs text-sky-600">
				<Plane class="size-3" />
				{day.flights.length}
			</span>
		{/if}
	</div>
	{#if day.date}
		<p class="mt-0.5 text-[11px] text-muted-foreground">
			{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
		</p>
	{/if}
</div>
