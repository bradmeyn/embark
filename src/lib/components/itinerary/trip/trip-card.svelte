<script lang="ts">
	import { resolve } from '$app/paths';
	import TripActionsMenu from '$lib/components/itinerary/trip/trip-actions-menu.svelte';
	import type { TripWithBasicDays } from '$lib/server/db/schemas/itinerary';
	import { groupLocationsByConsecutive } from '$lib/utils';

	let {
		trip,
		readonly = false
	}: {
		trip: TripWithBasicDays;
		readonly?: boolean;
	} = $props();

	const locations = $derived(groupLocationsByConsecutive(trip.days));
</script>

<div class="relative rounded-xl">
	<a
		href={resolve(`/trips/${trip.id}`)}
		class="block overflow-hidden rounded-xl border-2 bg-card shadow-sm transition-all hover:border-primary hover:shadow-md"
	>
		{#if trip.coverImage}
			<div class="relative h-40 overflow-hidden">
				<img src={trip.coverImage} alt="Trip cover" class="h-full w-full object-cover" />
				<div class="absolute inset-0 bg-linear-to-t from-black/30 to-transparent"></div>
			</div>
		{:else}
			<div class="h-40 bg-linear-to-br from-primary/20 to-primary/5"></div>
		{/if}

		<div class="px-4 py-3">
			<h2 class="font-serif text-xl text-foreground">{trip.name}</h2>
			{#if locations.length > 0}
				<p class="mt-0.5 truncate text-xs text-muted-foreground">
					{locations.map((l) => l.location).join(' · ')}
				</p>
			{/if}
			<p class="mt-0.5 text-xs text-muted-foreground">
				{trip.days.length}
				{trip.days.length === 1 ? 'day' : 'days'} planned
			</p>
		</div>
	</a>

	{#if !readonly}
		<div class="absolute top-3 right-3 z-10">
			<TripActionsMenu {trip} />
		</div>
	{/if}
</div>
