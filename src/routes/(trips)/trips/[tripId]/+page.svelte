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
		<div class="hidden h-full flex-col overflow-hidden lg:flex">
			<div class="shrink-0 p-4">
				<TripSummaryCard
					days={trip.days}
					travelSegments={trip.travelSegments}
					{locationGroups}
					{tripTotal}
					mapClass="h-60 rounded-lg"
					showStats
				/>
			</div>

			<div class="flex flex-1 overflow-hidden">
				<DesktopDaySidebar
					days={trip.days}
					travelSegments={trip.travelSegments}
					tripId={trip.id}
					selectedDayId={selectedDay?.id ?? null}
					onSelectDay={(id) => (selectedDayId = id)}
				/>

				<!-- Detail panel -->
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
			<div class="shrink-0 border-b bg-muted/30 p-3">
				<TripSummaryCard
					days={trip.days}
					travelSegments={trip.travelSegments}
					{locationGroups}
					mapClass="h-36 rounded-lg"
				/>
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
