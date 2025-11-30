<script lang="ts">
	import { getItinerary } from '$lib/remotes/itinerary.remote';
	import DayItinerary from '$lib/components/itinerary/day-itinerary.svelte';
	import GetStarted from '$lib/components/itinerary/get-started.svelte';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import AddDayDialog from '$lib/components/itinerary/add-day-dialog.svelte';
	import { ArrowRight } from '@lucide/svelte';
	import { groupLocationsByConsecutive } from '$lib/utils';

	let { params } = $props();

	const itinerary = $derived(await getItinerary(params.itineraryId));
	const locationGroups = $derived(groupLocationsByConsecutive(itinerary.days));
	const nextDayNumber = $derived(
		itinerary.days.reduce((max, day) => Math.max(max, day.dayNumber ?? 0), 0) + 1
	);
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
					<Breadcrumb.Link href={`/trips/${itinerary.trip.id}`}
						>{itinerary.trip.name}</Breadcrumb.Link
					>
				</Breadcrumb.Item>
				<Breadcrumb.Separator />
				<Breadcrumb.Item>
					<Breadcrumb.Page>{itinerary.name}</Breadcrumb.Page>
				</Breadcrumb.Item>
			</Breadcrumb.List>
		</Breadcrumb.Root>
	</div>

	{#if itinerary.days.length > 0}
		<div class="flex items-start justify-between">
			<div>
				<p class="text-xs text-muted-foreground uppercase">Itinerary</p>
				<h1 class="heading-1">{itinerary.name}</h1>
			</div>
			<AddDayDialog itineraryId={itinerary.id} {nextDayNumber} />
		</div>

		<section class="mt-6 mb-8 rounded-2xl border bg-card/70 p-6 shadow-sm">
			<div class="flex items-center justify-between">
				<h2 class="font-serif text-xl">Route overview</h2>
				<p class="text-sm text-muted-foreground">
					{itinerary.days.length}
					{itinerary.days.length === 1 ? 'day' : 'days'} planned
				</p>
			</div>

			<div class="mt-4 flex flex-wrap items-center gap-3">
				{#each locationGroups as group, index}
					<div class="flex items-center gap-3">
						<div
							class="rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary"
						>
							{group.location} ({group.days}
							{group.days === 1 ? 'day' : 'days'})
						</div>
						{#if index < locationGroups.length - 1}
							<ArrowRight class="h-4 w-4 text-muted-foreground" />
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/if}

	{#if itinerary.days.length === 0}
		<GetStarted itineraryId={itinerary.id} />
	{:else}
		<Accordion.Root type="multiple" class="w-full">
			{#each itinerary.days as day (day.id)}
				<DayItinerary {day} itineraryId={itinerary.id} />
			{/each}
		</Accordion.Root>
	{/if}
</div>
