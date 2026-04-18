<script lang="ts">
	import type { DayWithActivities } from '$db/schemas/itinerary';
	import { Building2, Plane, Activity, DollarSign } from '@lucide/svelte';

	let {
		days,
		onSelectDay
	}: {
		days: DayWithActivities[];
		onSelectDay: (dayId: string) => void;
	} = $props();

	function dayTotal(day: DayWithActivities) {
		return (
			day.activities.reduce((s, a) => s + (Number(a.cost) || 0), 0) +
			day.hotels.reduce((s, h) => s + (Number(h.cost) || 0), 0) +
			day.flights.reduce((s, f) => s + (Number(f.cost) || 0), 0)
		);
	}

	
</script>

<div class="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4">
	{#each days as day (day.id)}
		{@const total = dayTotal(day)}
		<button
			onclick={() => onSelectDay(day.id)}
			class="group rounded-xl border bg-card p-3 text-left shadow-sm transition-all hover:border-primary hover:shadow-md focus:ring-2 focus:ring-primary/40 focus:outline-none"
		>
			<div class="mb-2 flex items-start justify-between gap-1">
				<span
					class="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary group-hover:bg-primary group-hover:text-white"
				>
					Day {day.dayNumber}
				</span>
				{#if day.date}
					<span class="text-[10px] text-muted-foreground">
						{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
					</span>
				{/if}
			</div>

			<p class="truncate font-serif text-sm leading-snug font-medium">{day.location}</p>

			{#if day.overview}
				<p class="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{day.overview}</p>
			{/if}

			<div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
				{#if day.activities.length > 0}
					<span class="flex items-center gap-0.5">
						<Activity class="size-3 text-primary" />
						{day.activities.length}
					</span>
				{/if}
				{#if day.hotels.length > 0}
					<span class="flex items-center gap-0.5">
						<Building2 class="size-3 text-amber-500" />
						{day.hotels.length}
					</span>
				{/if}
				{#if day.flights.length > 0}
					<span class="flex items-center gap-0.5">
						<Plane class="size-3 text-sky-500" />
						{day.flights.length}
					</span>
				{/if}
				{#if total > 0}
					<span class="ml-auto flex items-center gap-0.5 font-medium text-foreground">
						<DollarSign class="size-3" />
						{total.toFixed(0)}
					</span>
				{/if}
			</div>
		</button>
	{/each}
</div>
