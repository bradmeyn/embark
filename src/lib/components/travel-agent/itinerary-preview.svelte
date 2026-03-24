<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Button from '$ui/button/button.svelte';
	import Spinner from '$ui/spinner/spinner.svelte';
	import ItineraryMap from '$lib/components/itinerary/itinerary-map.svelte';
	import type { DayWithActivities } from '$db/schemas/itinerary';
	import {
		generateTripDraft,
		saveGeneratedTrip,
		type GeneratedTripDraft
	} from '$lib/remotes/travel-agent/travel-agent.remote';

	type PreviewDay = GeneratedTripDraft['days'][number] & {
		latitude?: number | null;
		longitude?: number | null;
	};

	const draft = $derived(generateTripDraft.result?.draft ?? null);

	const totalActivities = $derived(
		draft ? draft.days.reduce((acc, day) => acc + day.activities.length, 0) : 0
	);
	const totalHotelNights = $derived(
		draft
			? draft.days.reduce(
					(acc, day) => acc + day.hotels.reduce((n, hotel) => n + (hotel.nights ?? 1), 0),
					0
				)
			: 0
	);

	const mapDays = $derived(
		draft
			? (draft.days.map((day, i) => ({
					id: `preview-${i + 1}`,
					tripId: 'preview',
					dayNumber: day.dayNumber,
					overview: day.overview ?? null,
					date: null,
					location: day.location,
					latitude: (day as PreviewDay).latitude ?? null,
					longitude: (day as PreviewDay).longitude ?? null,
					createdAt: new Date(),
					updatedAt: new Date(),
					activities: [],
					hotels: [],
					flights: []
				})) as DayWithActivities[])
			: []
	);

	const hasMap = $derived(mapDays.some((d) => d.latitude != null && d.longitude != null));

	let saveError = $state('');

	async function onSave() {
		if (!draft) return;
		saveError = '';

		try {
			const result = await saveGeneratedTrip({ draft });
			if (result.tripId) {
				await goto(resolve(`/trips/${result.tripId}`));
				return;
			}
			saveError = 'Trip was saved, but redirect failed. Please refresh your trips list.';
		} catch {
			saveError = 'Unable to save generated trip. Please try again.';
		}
	}
</script>

{#if saveError}
	<p
		class="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
	>
		{saveError}
	</p>
{/if}

<section class="space-y-6">
	{#if hasMap}
		<div class="rounded-xl border bg-card p-3 shadow-sm">
			<ItineraryMap days={mapDays} class="h-72 rounded-lg" />
		</div>
	{/if}

	<div class="grid gap-4 md:grid-cols-4">
		<div class="rounded-xl border bg-card p-4 shadow-sm md:col-span-2">
			<p class="font-serif text-2xl">{draft?.tripName}</p>
			{#if draft?.summary}
				<p class="mt-1 text-sm text-muted-foreground">{draft.summary}</p>
			{/if}
		</div>
		<div class="rounded-xl border bg-card p-4 shadow-sm">
			<p class="text-xs text-muted-foreground uppercase">Days</p>
			<p class="font-serif text-3xl">{draft?.days.length}</p>
		</div>
		<div class="rounded-xl border bg-card p-4 shadow-sm">
			<p class="text-xs text-muted-foreground uppercase">Activities</p>
			<p class="font-serif text-3xl">{totalActivities}</p>
			<p class="text-xs text-muted-foreground">{totalHotelNights} hotel nights</p>
		</div>
	</div>

	<div class="rounded-xl border bg-card p-4 shadow-sm">
		<div class="mb-3 flex items-center justify-between">
			<h2 class="font-semibold">Day-by-day itinerary</h2>
			<Button onclick={onSave} disabled={!!saveGeneratedTrip.pending}>
				{#if saveGeneratedTrip.pending}
					<Spinner class="size-4" />
				{:else}
					Save to trips
				{/if}
			</Button>
		</div>

		<div class="space-y-3">
			{#each draft?.days ?? [] as day (day.dayNumber)}
				<article class="rounded-lg border p-3">
					<div class="mb-2 flex items-center justify-between gap-2">
						<p class="font-medium">Day {day.dayNumber}: {day.location}</p>
						<span class="text-xs text-muted-foreground">{day.activities.length} activities</span>
					</div>
					{#if day.overview}
						<p class="mb-2 text-sm text-muted-foreground">{day.overview}</p>
					{/if}

					{#if day.activities.length > 0}
						<ul class="mb-2 list-disc space-y-1 pl-5 text-sm">
							{#each day.activities as activity, i (`${activity.name}-${i}`)}
								<li>{activity.name}</li>
							{/each}
						</ul>
					{/if}

					{#if day.hotels.length > 0}
						<p class="text-xs text-muted-foreground">
							Stay: {day.hotels[0]?.name} ({day.hotels[0]?.nights ?? 1}
							{(day.hotels[0]?.nights ?? 1) === 1 ? 'night' : 'nights'})
						</p>
					{/if}
				</article>
			{/each}
		</div>
	</div>
</section>
