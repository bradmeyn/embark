<script lang="ts">
	import type { LocationGroup } from '$lib/utils';

	let {
		locationGroups,
		tripTotal,
		dayCount,
		showStats = false
	}: {
		locationGroups: LocationGroup[];
		tripTotal?: number;
		dayCount?: number;
		showStats?: boolean;
	} = $props();
</script>

<div class="rounded-xl border bg-card shadow-sm">
	<div class="flex items-center p-3">
		<div class="scrollbar-none flex flex-1 items-center gap-2 overflow-x-auto">
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
				<div class="flex shrink-0 items-center gap-3 pl-3 text-xs text-muted-foreground">
					{#if dayCount}
						<span>{dayCount} {dayCount === 1 ? 'day' : 'days'}</span>
					{/if}
					{#if tripTotal && tripTotal > 0}
						<span class="font-medium text-foreground">${tripTotal.toFixed(2)} total</span>
					{/if}
				</div>
			{/if}
		</div>

	</div>
</div>
