<script lang="ts">
	import { getTrip } from '$lib/remotes/trip.remote';
	import { page } from '$app/state';
	import AddItinerary from '$lib/components/itinerary/add-itinerary-dialog.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import { ArrowRight, Calendar, MapPin } from '@lucide/svelte';
	import { groupLocationsByConsecutive } from '$lib/utils';

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

	<div class="mb-8">
		<p class="text-xs tracking-wide text-muted-foreground uppercase">Trip</p>
		<h1 class="font-serif text-4xl font-light text-foreground">{trip.name}</h1>
	</div>

	{#if trip.itineraries.length === 0}
		<div
			class="my-8 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-8 text-center"
		>
			<div class="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
				<Calendar class="size-6 text-primary" />
			</div>
			<h2 class="mb-2 font-serif text-2xl">No itineraries yet</h2>
			<p class="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
				Plan your trip by creating an itinerary. You can add days, activities, and share the plan
				with others.
			</p>
			<AddItinerary tripId={page.params.tripId!} />
		</div>
	{:else}
		<div class="mb-6 flex items-center justify-between">
			<h2 class="font-serif text-xl">Itineraries</h2>
			<AddItinerary tripId={page.params.tripId!} />
		</div>

		<ul class="space-y-4">
			{#each trip.itineraries as itinerary}
				<li>
					<a
						href={`/trips/${trip.id}/itineraries/${itinerary.id}`}
						class="group block rounded-xl border bg-card p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
					>
						<div class="flex items-start justify-between">
							<div>
								<h3 class="font-serif text-xl text-foreground group-hover:text-primary">
									{itinerary.name}
								</h3>
								<p class="mt-1 text-sm text-muted-foreground">
									{itinerary.days.length}
									{itinerary.days.length === 1 ? 'day' : 'days'}
								</p>
							</div>
							<ArrowRight
								class="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
							/>
						</div>
						{#if itinerary.days.length > 0}
							{@const locationGroups = groupLocationsByConsecutive(itinerary.days)}
							<div class="mt-3 flex flex-wrap items-center gap-2">
								{#each locationGroups.slice(0, 4) as group}
									<span
										class="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
									>
										<MapPin class="size-3" />
										{group.location}
										{#if group.days > 1}
											<span class="font-medium">({group.days} days)</span>
										{/if}
									</span>
								{/each}
								{#if locationGroups.length > 4}
									<span class="text-xs text-muted-foreground"
										>+{locationGroups.length - 4} more</span
									>
								{/if}
							</div>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</div>
