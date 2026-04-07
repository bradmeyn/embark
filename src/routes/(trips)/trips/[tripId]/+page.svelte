<script lang="ts">
	import { getTrip } from '$lib/remotes/trips/trip.remote';
	import { page } from '$app/state';
	import GetStarted from '$lib/components/itinerary/day/get-started.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import AddDayDialog from '$lib/components/itinerary/day/add-day-dialog.svelte';
	import ItineraryMap from '$lib/components/itinerary/itinerary-map.svelte';
	import DayListItem from '$lib/components/itinerary/day/day-list-item.svelte';
	import DayDetail from '$lib/components/itinerary/day/day-detail.svelte';
	import { groupLocationsByConsecutive } from '$lib/utils';
	import { Printer, PackageCheck, LayoutGrid, List } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import PackingListDialog from '$lib/components/itinerary/trip/packing-list-dialog.svelte';
	import DayOverviewGrid from '$lib/components/itinerary/day/day-overview-grid.svelte';

	let packingOpen = $state(false);
	let viewMode = $state<'detail' | 'overview'>('detail');

	const trip = $derived(await getTrip(page.params.tripId!));
	const nextDayNumber = $derived(
		trip.days.reduce((max, day) => Math.max(max, day.dayNumber ?? 0), 0) + 1
	);
	const hasMap = $derived(trip.days.some((d) => d.latitude != null));
	const locationGroups = $derived(groupLocationsByConsecutive(trip.days));

	let selectedDayId = $state<string | null>(null);

	$effect(() => {
		const ids = trip.days.map((d) => d.id);
		if (!selectedDayId && ids.length > 0) {
			selectedDayId = ids[0];
		} else if (selectedDayId && !ids.includes(selectedDayId)) {
			selectedDayId = ids[0] ?? null;
		}
	});

	const selectedDay = $derived(trip.days.find((d) => d.id === selectedDayId) ?? null);

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

	const mapKey = $derived(trip.days.map((d) => `${d.id}:${d.latitude}:${d.longitude}`).join(','));

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
	<!-- Header bar -->
	<div class="flex shrink-0 items-center justify-between border-b px-4 py-3 print:hidden">
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
			<Button
				variant="ghost"
				size="icon"
				class="size-8"
				onclick={() => (packingOpen = true)}
				aria-label="Packing list"
			>
				<PackageCheck class="size-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				class="size-8"
				onclick={() => window.print()}
				aria-label="Print itinerary"
			>
				<Printer class="size-4" />
			</Button>
		</div>
	</div>

	<PackingListDialog tripId={trip.id} bind:open={packingOpen} showTrigger={false} />

	{#if trip.days.length === 0}
		<div class="flex-1 overflow-y-auto p-6">
			<GetStarted tripId={trip.id} />
		</div>
	{:else}
		<!-- ── DESKTOP (lg+) ─────────────────────────────────────────── -->
		<div class="hidden h-full flex-col overflow-hidden lg:flex">
			<!-- Summary card -->
			<div class="shrink-0 p-4">
				<div class="rounded-xl border bg-card shadow-sm">
					<!-- Map with padding -->
					{#if hasMap}
						<div class="p-3 pb-0">
							<ItineraryMap days={trip.days} class="h-60 rounded-lg" />
						</div>
					{/if}

					<!-- Location summary -->
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
						<div class="ml-auto flex shrink-0 items-center gap-3 pl-3 text-xs text-muted-foreground">
							<span>{trip.days.length} {trip.days.length === 1 ? 'day' : 'days'}</span>
							{#if tripTotal > 0}
								<span class="font-medium text-foreground">${tripTotal.toFixed(2)} total</span>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<div class="flex flex-1 overflow-hidden">
				<!-- Sidebar -->
				<div class="flex w-48 shrink-0 flex-col border-r print:hidden">
					<div class="flex-1 space-y-1 overflow-y-auto p-1.5">
						{#each trip.days as day (day.id)}
							<button onclick={() => (selectedDayId = day.id)} class="w-full text-left">
								<DayListItem {day} active={selectedDayId === day.id} />
							</button>
						{/each}
					</div>
				</div>

				<!-- Detail panel -->
				<div class="flex-1 overflow-y-auto">
					<!-- Screen: show selected day or overview grid -->
					<div class="print:hidden">
						{#if viewMode === 'overview'}
							<DayOverviewGrid
								days={trip.days}
								onSelectDay={(id) => {
									selectedDayId = id;
									viewMode = 'detail';
								}}
							/>
						{:else if selectedDay}
							<DayDetail day={selectedDay} tripId={trip.id} {activeHotels} />
						{/if}
					</div>
					<!-- Print: show all days -->
					<div class="hidden print:block">
						{#each trip.days as day (day.id)}
							{@const printActiveHotels = trip.days
								.flatMap((d) => d.hotels)
								.filter((hotel) => {
									const checkInDay = trip.days.find((d) => d.id === hotel.dayId);
									if (!checkInDay) return false;
									const nights = hotel.nights ?? 1;
									return (
										day.dayNumber >= checkInDay.dayNumber &&
										day.dayNumber < checkInDay.dayNumber + nights
									);
								})}
							<div class="break-inside-avoid border-b last:border-0">
								<DayDetail {day} tripId={trip.id} activeHotels={printActiveHotels} />
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<!-- ── MOBILE (< lg) ─────────────────────────────────────────── -->
		<div class="flex flex-1 flex-col overflow-hidden lg:hidden">
			<!-- Summary card -->
			<div class="shrink-0 border-b bg-muted/30 p-3">
				<div class="rounded-xl border bg-card shadow-sm">
					{#if hasMap}
						<div class="p-3 pb-0">
							{#key mapKey}
								<ItineraryMap days={trip.days} class="h-36 rounded-lg" />
							{/key}
						</div>
					{/if}
					<div class="scrollbar-none flex gap-3 overflow-x-auto p-3">
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
					</div>
				</div>
			</div>

			<!-- Horizontal day chip selector -->
			<div class="shrink-0 border-b bg-background">
				<div class="scrollbar-none flex gap-2 overflow-x-auto px-3 py-2">
					{#each trip.days as day (day.id)}
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
					{/each}
				</div>
			</div>

			<!-- Day detail -->
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
					<DayDetail day={selectedDay} tripId={trip.id} {activeHotels} />
				{/if}
			</div>
		</div>
	{/if}
</div>
