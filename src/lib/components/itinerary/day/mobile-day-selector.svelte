<script lang="ts">
	import type { DayWithActivities } from '$db/schemas/itinerary';

	let {
		days,
		selectedDayId,
		onSelectDay
	}: {
		days: DayWithActivities[];
		selectedDayId: string | null;
		onSelectDay: (id: string) => void;
	} = $props();
</script>

<div class="shrink-0 border-b bg-background">
	<div class="scrollbar-none flex items-center gap-1 overflow-x-auto px-3 py-2">
		{#each days as day (day.id)}
			<button
				onclick={() => onSelectDay(day.id)}
				class="flex shrink-0 flex-col items-start rounded-lg border px-3 py-2 text-left transition-colors {selectedDayId ===
				day.id
					? 'border-primary bg-primary/5'
					: 'border-transparent bg-muted/50 hover:bg-muted'}"
			>
				<span class="text-xs font-semibold text-primary">Day {day.dayNumber}</span>
				<span class="max-w-24 truncate font-serif text-sm">{day.location}</span>
			</button>
		{/each}
	</div>
</div>
