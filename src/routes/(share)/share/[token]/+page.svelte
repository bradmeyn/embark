<script lang="ts">
	import { page } from '$app/state';
	import { getSharedTrip } from '$lib/remotes/share.remote';
	import DayDetailReadonly from '$lib/components/itinerary/day-detail-readonly.svelte';
	import ItineraryMap from '$lib/components/itinerary/itinerary-map.svelte';
	import DayListItem from '$lib/components/itinerary/day-list-item.svelte';
	import { groupLocationsByConsecutive } from '$lib/utils';

	const trip = await getSharedTrip(page.params.token!);

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

	const mapKey = $derived(
		trip.days.map((d) => `${d.id}:${d.latitude}:${d.longitude}`).join(',')
	);
</script>

<svelte:head>
	<title>{trip.name} — Embark</title>
</svelte:head>

<div class="mx-auto flex h-[calc(100svh-57px)] w-full max-w-6xl flex-col bg-background">
	<!-- Header -->
	<div class="flex shrink-0 items-center justify-between border-b px-4 py-3">
		<div>
			<h1 class="font-serif text-xl">{trip.name}</h1>
			<p class="text-xs text-muted-foreground">Read-only view</p>
		</div>
		<span class="text-sm text-muted-foreground">
			{trip.days.length}
			{trip.days.length === 1 ? 'day' : 'days'} planned
		</span>
	</div>

	{#if trip.days.length === 0}
		<div class="flex flex-1 items-center justify-center">
			<p class="text-muted-foreground">No days planned yet.</p>
		</div>
	{:else}
		<!-- Desktop -->
		<div class="hidden h-full flex-col overflow-hidden lg:flex">
			<!-- Summary card -->
			<div class="shrink-0 border-b bg-muted/30 p-4">
				<div class="rounded-xl border bg-card shadow-sm">
					{#if hasMap}
						<div class="p-3 pb-0">
							{#key mapKey}
								<ItineraryMap days={trip.days} class="h-48 rounded-lg" />
							{/key}
						</div>
					{/if}
					<div class="flex items-center gap-2 overflow-x-auto p-3 scrollbar-none">
						{#each locationGroups as group, i (group.startDay)}
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
						<div class="ml-auto shrink-0 pl-3 text-xs text-muted-foreground">
							{trip.days.length}
							{trip.days.length === 1 ? 'day' : 'days'}
						</div>
					</div>
				</div>
			</div>

			<div class="flex flex-1 overflow-hidden">
				<!-- Sidebar -->
				<div class="flex w-64 shrink-0 flex-col border-r">
					<div class="flex-1 space-y-1 overflow-y-auto p-2">
						{#each trip.days as day (day.id)}
							<button onclick={() => (selectedDayId = day.id)} class="w-full text-left">
								<DayListItem {day} active={selectedDayId === day.id} />
							</button>
						{/each}
					</div>
				</div>

				<!-- Detail panel -->
				<div class="flex-1 overflow-y-auto">
					{#if selectedDay}
						<DayDetailReadonly day={selectedDay} />
					{/if}
				</div>
			</div>
		</div>

		<!-- Mobile -->
		<div class="flex flex-1 flex-col overflow-hidden lg:hidden">
			<div class="shrink-0 border-b bg-muted/30 p-3">
				<div class="rounded-xl border bg-card shadow-sm">
					{#if hasMap}
						<div class="p-3 pb-0">
							{#key mapKey}
								<ItineraryMap days={trip.days} class="h-36 rounded-lg" />
							{/key}
						</div>
					{/if}
					<div class="flex gap-3 overflow-x-auto p-3 scrollbar-none">
						{#each locationGroups as group, i (group.startDay)}
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

			<!-- Day chip selector -->
			<div class="shrink-0 border-b bg-background">
				<div class="flex gap-2 overflow-x-auto px-3 py-2 scrollbar-none">
					{#each trip.days as day (day.id)}
						<button
							onclick={() => (selectedDayId = day.id)}
							class="flex shrink-0 flex-col items-start rounded-lg border px-3 py-2 text-left transition-colors {selectedDayId ===
							day.id
								? 'border-primary bg-primary/5'
								: 'border-transparent bg-muted/50 hover:bg-muted'}"
						>
							<span class="text-xs font-semibold text-primary">Day {day.dayNumber}</span>
							<span class="max-w-[96px] truncate font-serif text-sm">{day.location}</span>
						</button>
					{/each}
				</div>
			</div>

			<div class="flex-1 overflow-y-auto">
				{#if selectedDay}
					<DayDetailReadonly day={selectedDay} />
				{/if}
			</div>
		</div>
	{/if}
</div>
