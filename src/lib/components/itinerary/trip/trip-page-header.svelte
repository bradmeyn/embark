<script lang="ts">
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import AddDayDialog from '$lib/components/itinerary/day/add-day-dialog.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { LayoutGrid, List } from '@lucide/svelte';
	import type { TripWithDays } from '$db/schemas/itinerary';

	let {
		trip,
		nextDayNumber,
		viewMode = $bindable()
	}: {
		trip: TripWithDays;
		nextDayNumber: number;
		viewMode: 'detail' | 'overview';
	} = $props();
</script>

<div class="flex shrink-0 items-center justify-between border-b px-4 py-3">
	<Breadcrumb.Root>
		<Breadcrumb.List>
			<Breadcrumb.Item>
				<Breadcrumb.Link href="/trips">Trips</Breadcrumb.Link>
			</Breadcrumb.Item>
			<Breadcrumb.Separator />
			<Breadcrumb.Item>
				<Breadcrumb.Page>{trip.name}</Breadcrumb.Page>
			</Breadcrumb.Item>
		</Breadcrumb.List>
	</Breadcrumb.Root>

	<div class="flex items-center gap-2">
		{#if trip.days.length > 0}
			<span class="hidden text-sm text-muted-foreground sm:block">
				{trip.days.length}
				{trip.days.length === 1 ? 'day' : 'days'} planned
			</span>
			<AddDayDialog tripId={trip.id} {nextDayNumber} />
		{/if}
		{#if trip.days.length > 0}
			<Button
				variant="ghost"
				size="icon"
				class="size-8"
				onclick={() => (viewMode = viewMode === 'overview' ? 'detail' : 'overview')}
				aria-label={viewMode === 'overview' ? 'Day detail view' : 'Overview grid'}
				title={viewMode === 'overview' ? 'Day detail view' : 'Overview grid'}
			>
				{#if viewMode === 'overview'}
					<List class="size-4" />
				{:else}
					<LayoutGrid class="size-4" />
				{/if}
			</Button>
		{/if}
	</div>
</div>
