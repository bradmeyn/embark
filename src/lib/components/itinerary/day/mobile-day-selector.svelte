<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import type { DayWithActivities } from '$db/schemas/itinerary';

	let {
		days,
		selectedDayId = $bindable(),
		onInsertDay
	}: {
		days: DayWithActivities[];
		selectedDayId: string | null;
		onInsertDay: (atPosition: number) => void;
	} = $props();
</script>

<div class="shrink-0 border-b bg-background">
	<div class="scrollbar-none flex items-center gap-1 overflow-x-auto px-3 py-2">
		{#each days as day, i (day.id)}
			<button
				onclick={() => (selectedDayId = day.id)}
				class="flex shrink-0 flex-col items-start rounded-lg border px-3 py-2 text-left transition-colors {selectedDayId ===
				day.id
					? 'border-primary bg-primary/5'
					: 'border-transparent bg-muted/50 hover:bg-muted'}"
			>
				<span class="text-xs font-semibold text-primary">Day {day.dayNumber}</span>
				<span class="max-w-24 truncate font-serif text-sm">{day.location}</span>
			</button>
			{#if i < days.length - 1}
				<button
					onclick={() => onInsertDay(days[i + 1].dayNumber)}
					class="flex size-5 shrink-0 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
					aria-label="Insert day"
					title="Insert day here"
				>
					<Plus class="size-3" />
				</button>
			{/if}
		{/each}
	</div>
</div>
