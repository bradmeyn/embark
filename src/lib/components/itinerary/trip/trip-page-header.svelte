<script lang="ts">
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import AddDayDialog from '$lib/components/itinerary/day/add-day-dialog.svelte';
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

	{#if trip.days.length > 0}
		<AddDayDialog tripId={trip.id} {nextDayNumber} days={trip.days} />
	{/if}
</div>
