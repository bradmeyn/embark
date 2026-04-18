<script lang="ts">
	import { getTrip } from '$lib/remotes/trips/trip.remote';
	import { page } from '$app/state';
	import GetStarted from '$lib/components/itinerary/day/get-started.svelte';
	import DayDetail from '$lib/components/itinerary/day/day-detail.svelte';
	import { groupLocationsByConsecutive } from '$lib/utils';
	import DayOverviewGrid from '$lib/components/itinerary/day/day-overview-grid.svelte';
	import TripPageHeader from '$lib/components/itinerary/trip/trip-page-header.svelte';
	import TripSummaryCard from '$lib/components/itinerary/trip/trip-summary-card.svelte';
	import DesktopDaySidebar from '$lib/components/itinerary/day/desktop-day-sidebar.svelte';
	import MobileDaySelector from '$lib/components/itinerary/day/mobile-day-selector.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { LayoutGrid, List } from '@lucide/svelte';
	let viewMode = $state<'detail' | 'overview'>('detail');

	const trip = $derived(await getTrip(page.params.tripId!));
	const nextDayNumber = $derived(
		trip.days.reduce((max, day) => Math.max(max, day.dayNumber ?? 0), 0) + 1
	);
	const locationGroups = $derived(groupLocationsByConsecutive(trip.days));

	let selectedDayId = $state<string | null>(null);

	const selectedDay = $derived(
		trip.days.find((d) => d.id === selectedDayId) ?? trip.days[0] ?? null
	);

	const outgoingSegment = $derived(
		selectedDay ? (trip.travelSegments.find((s) => s.fromDayId === selectedDay.id) ?? null) : null
	);

	const activeHotels = $derived(
		selectedDay
			? trip.days
					.flatMap((d) => d.hotels)
					.filter((hotel) => {
						const checkInDay = trip.days.find((d) => d.id === hotel.dayId);
						if (!checkInDay) return false;
						const nights = hotel.nights ?? 1;
						return (
							selectedDay.dayNumber >= checkInDay.dayNumber &&
							selectedDay.dayNumber < checkInDay.dayNumber + nights
						);
					})
			: []
	);

	const tripTotal = $derived(
		trip.days.reduce(
			(sum, day) =>
				sum +
				day.activities.reduce((s, a) => s + (Number(a.cost) || 0), 0) +
				day.hotels.reduce((s, h) => s + (Number(h.cost) || 0), 0) +
				day.flights.reduce((s, f) => s + (Number(f.cost) || 0), 0),
			0
		)
	);
</script>

<div class="flex h-full flex-col bg-background">
	<TripPageHeader {trip} {nextDayNumber} bind:viewMode />

	{#if trip.days.length === 0}
		<div class="flex-1 overflow-y-auto p-6">
			<GetStarted tripId={trip.id} />
		</div>
	{:else}
		<!-- ── DESKTOP (lg+) ─────────────────────────────────────────── -->
		<div class="hidden h-full overflow-hidden lg:flex">
			<DesktopDaySidebar
				days={trip.days}
				travelSegments={trip.travelSegments}
				selectedDayId={selectedDay?.id ?? null}
				onSelectDay={(id) => (selectedDayId = id)}
			/>

			<!-- Detail panel -->
			<div class="flex flex-1 flex-col overflow-hidden">
				<div class="shrink-0 p-4 pb-0">
					<div class="mb-4 flex items-start justify-between gap-4">
						<div>
							<h2 class="font-serif text-xl font-light">Trip Overview</h2>
							<p class="text-sm text-muted-foreground">
								{trip.days.length}
								{trip.days.length === 1 ? 'day' : 'days'} planned
							</p>
						</div>
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
					<TripSummaryCard {locationGroups} {tripTotal} dayCount={trip.days.length} showStats />
				</div>

				<div class="flex-1 overflow-y-auto">
					{#if viewMode === 'overview'}
						<DayOverviewGrid
							days={trip.days}
							onSelectDay={(id) => {
								selectedDayId = id;
								viewMode = 'detail';
							}}
						/>
					{:else if selectedDay}
						<DayDetail day={selectedDay} tripId={trip.id} {activeHotels} {outgoingSegment} />
					{/if}
				</div>
			</div>
		</div>

		<!-- ── MOBILE (< lg) ─────────────────────────────────────────── -->
		<div class="flex flex-1 flex-col overflow-hidden lg:hidden">
			<div class="p-3 pb-0">
				<h2 class="font-serif text-xl font-light">Trip Overview</h2>
				<p class="text-sm text-muted-foreground">
					{trip.days.length}
					{trip.days.length === 1 ? 'day' : 'days'} planned
				</p>
			</div>
			<div class="shrink-0 border-b bg-muted/30 p-3">
				<TripSummaryCard {locationGroups} />
			</div>

			<MobileDaySelector
				days={trip.days}
				selectedDayId={selectedDay?.id ?? null}
				onSelectDay={(id) => (selectedDayId = id)}
			/>

			<div class="flex-1 overflow-y-auto">
				{#if viewMode === 'overview'}
					<DayOverviewGrid
						days={trip.days}
						onSelectDay={(id) => {
							selectedDayId = id;
							viewMode = 'detail';
						}}
					/>
				{:else if selectedDay}
					<DayDetail day={selectedDay} tripId={trip.id} {activeHotels} {outgoingSegment} />
				{/if}
			</div>
		</div>
	{/if}
</div>
