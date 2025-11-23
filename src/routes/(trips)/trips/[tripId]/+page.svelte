<script lang="ts">
	import { getTrip } from '$lib/remotes/trip.remote';
	import { page } from '$app/state';
	import AddItinerary from '$lib/components/itinerary/add-itinerary-dialog.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	const trip = $derived(await getTrip(page.params.tripId!));
</script>

<div class="container mx-auto max-w-3xl">
	<div class="mb-4">
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
	</div>
	<h1 class="mb-4 font-serif text-4xl font-light">{trip.name} Itineraries</h1>

	{#if trip.itineraries.length === 0}
		<div class="my-8 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
			<h2 class="mb-2 text-2xl font-semibold">No itineraries yet</h2>
			<p class="mx-auto mb-4 max-w-md text-sm text-muted-foreground">
				Plan your trip by creating an itinerary. You can add days, activities, and share the plan
				with others.
			</p>
			<AddItinerary tripId={page.params.tripId!} />
		</div>
	{/if}

	<ul>
		{#each trip.itineraries as itinerary}
			<li>
				<a
					href={`/trips/${trip.id}/itineraries/${itinerary.id}`}
					class="mb-4 block rounded-lg border p-4 text-muted-foreground shadow-sm hover:border-primary"
					><h2 class="font-serif text-2xl">{itinerary.name}</h2>
					<small>
						{itinerary.days.length > 1 ? `${itinerary.days.length} Days` : '1 Day'}
					</small>
				</a>
			</li>
		{/each}
	</ul>
	{#if trip.itineraries.length > 0}
		<AddItinerary tripId={page.params.tripId!} />
	{/if}
</div>
