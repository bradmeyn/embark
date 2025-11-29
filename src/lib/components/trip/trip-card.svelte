<script lang="ts">
	import TripActionsMenu from '$lib/components/trip/trip-actions-menu.svelte';
	import { ArrowRight } from '@lucide/svelte';
	import type { TripWithItineraries } from '$lib/server/db/schemas/itinerary';

	let { trip }: { trip: TripWithItineraries } = $props();
</script>

<div class=" rounded-lg border-2 bg-white shadow-sm">
	<div class="flex items-center justify-between p-6">
		<div class="flex items-center justify-between">
			<a href={`/trips/${trip.id}`} title="View trip details">
				<h2 class="font-serif text-2xl text-muted-foreground">{trip.name}</h2>
			</a>
		</div>
		<div>
			<TripActionsMenu {trip} />
		</div>
	</div>

	<div class="border-t bg-gray-50/50 px-6 py-4">
		{#if trip.itineraries.length === 0}
			<p class="mb-3 text-sm text-muted-foreground">
				No itineraries yet. Create your first itinerary to start planning!
			</p>
		{:else}
			<div class="space-y-3">
				<h3 class="text-sm font-medium text-muted-foreground">Itineraries</h3>
				<div class="space-y-2">
					{#each trip.itineraries as itinerary}
						<a
							href={`/trips/${trip.id}/itineraries/${itinerary.id}`}
							class="block rounded-md border bg-white p-4 transition-all hover:border-primary hover:shadow-sm"
						>
							<div class="flex items-center justify-between">
								<div>
									<h4 class="text-sm font-medium text-primary">{itinerary.name}</h4>
									{#if itinerary.days.length > 0}
										<p class="text-xs text-muted-foreground">
											{itinerary.days.length}
											{itinerary.days.length === 1 ? ' day' : ' days'} planned
										</p>
									{:else}
										<p class="text-xs text-muted-foreground">No days planned yet</p>
									{/if}
								</div>
								<ArrowRight class="size-3 text-muted-foreground" />
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
