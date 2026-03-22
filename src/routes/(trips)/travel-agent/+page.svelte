<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Button from '$ui/button/button.svelte';
	import Input from '$ui/input/input.svelte';
	import * as Field from '$ui/field';
	import Spinner from '$ui/spinner/spinner.svelte';
	import GlobeLoader from '$lib/components/travel-agent/globe-loader.svelte';
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

	let saveError = $state('');

	const draft = $derived(generateTripDraft.result?.draft ?? null);

	const styleOptions = ['Relaxed', 'Adventure', 'Food-focused', 'Luxury', 'Family'];
	const paceOptions = ['Slow', 'Balanced', 'Packed'];

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

<div class="mx-auto h-full max-w-6xl overflow-y-auto px-4 pt-6 pb-10">
	<div class="mb-6 text-center">
		<p class="text-xs font-semibold tracking-wide text-primary uppercase">AI Planner</p>
		<h1 class="font-serif text-3xl">Travel Agent</h1>
		<p class="text-sm text-muted-foreground">
			Generate an editable itinerary draft with days, activity ideas, and accommodation suggestions.
		</p>
	</div>

	<section class="rounded-xl border bg-card p-4 shadow-sm {draft ? '' : 'mx-auto max-w-3xl'}">
		<form
			{...generateTripDraft.enhance(async ({ submit }) => {
				await submit();
			})}
			class="space-y-3"
		>
			{#each generateTripDraft.fields.issues() as issue (issue.message)}
				<p class="text-sm text-destructive">{issue.message}</p>
			{/each}

			<div class="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
				<Field.Field class="lg:col-span-2">
					<Field.Label for="destinations">Destination(s)</Field.Label>
					<Input
						{...generateTripDraft.fields.destinations.as('text')}
						id="destinations"
						placeholder="Tokyo + Kyoto"
						required
					/>
					<Field.Error errors={generateTripDraft.fields.destinations.issues()} />
				</Field.Field>

				<Field.Field>
					<Field.Label for="numberOfDays">Days</Field.Label>
					<Input
						{...generateTripDraft.fields.numberOfDays.as('number')}
						id="numberOfDays"
						min="1"
						max="30"
						required
					/>
					<Field.Error errors={generateTripDraft.fields.numberOfDays.issues()} />
				</Field.Field>

				<Field.Field>
					<Field.Label for="budget">Budget</Field.Label>
					<Input
						{...generateTripDraft.fields.budget.as('text')}
						id="budget"
						placeholder="~ $3500"
						required
					/>
					<Field.Error errors={generateTripDraft.fields.budget.issues()} />
				</Field.Field>

				<Field.Field>
					<Field.Label for="style">Style</Field.Label>
					<select
						{...generateTripDraft.fields.style.as('select')}
						id="style"
						class="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
						required
					>
						<option value="" disabled>Choose style</option>
						{#each styleOptions as option (option)}
							<option value={option}>{option}</option>
						{/each}
					</select>
					<Field.Error errors={generateTripDraft.fields.style.issues()} />
				</Field.Field>

				<Field.Field>
					<Field.Label for="pace">Pace</Field.Label>
					<select
						{...generateTripDraft.fields.pace.as('select')}
						id="pace"
						class="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
						required
					>
						<option value="" disabled>Choose pace</option>
						{#each paceOptions as option (option)}
							<option value={option}>{option}</option>
						{/each}
					</select>
					<Field.Error errors={generateTripDraft.fields.pace.issues()} />
				</Field.Field>

				<Field.Field class="md:col-span-2 lg:col-span-6">
					<Field.Label for="interests">Interests</Field.Label>
					<Input
						{...generateTripDraft.fields.interests.as('text')}
						id="interests"
						placeholder="Food, temples, nightlife, design"
						required
					/>
					<Field.Error errors={generateTripDraft.fields.interests.issues()} />
				</Field.Field>
			</div>

			<div class="flex items-center justify-between gap-3 pt-1">
				<p class="text-xs text-muted-foreground">Flights are intentionally excluded for now.</p>
				<Button type="submit" disabled={!!generateTripDraft.pending}>
					{#if generateTripDraft.pending}
						<Spinner class="size-4" />
					{:else if draft}
						Regenerate
					{:else}
						Generate itinerary
					{/if}
				</Button>
			</div>
		</form>
	</section>

	{#if saveError}
		<p
			class="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
		>
			{saveError}
		</p>
	{/if}

	{#if generateTripDraft.pending}
		<section class="mt-6 rounded-xl border bg-card p-6 shadow-sm">
			<GlobeLoader label="Building your day-by-day plan..." />
		</section>
	{:else if draft}
		<section class="mt-6 space-y-6">
			{#if hasMap}
				<div class="rounded-xl border bg-card p-3 shadow-sm">
					<ItineraryMap days={mapDays} class="h-72 rounded-lg" />
				</div>
			{/if}

			<div class="grid gap-4 md:grid-cols-4">
				<div class="rounded-xl border bg-card p-4 shadow-sm md:col-span-2">
					<p class="font-serif text-2xl">{draft.tripName}</p>
					{#if draft.summary}
						<p class="mt-1 text-sm text-muted-foreground">{draft.summary}</p>
					{/if}
				</div>
				<div class="rounded-xl border bg-card p-4 shadow-sm">
					<p class="text-xs text-muted-foreground uppercase">Days</p>
					<p class="font-serif text-3xl">{draft.days.length}</p>
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
					{#each draft.days as day (day.dayNumber)}
						<article class="rounded-lg border p-3">
							<div class="mb-2 flex items-center justify-between gap-2">
								<p class="font-medium">Day {day.dayNumber}: {day.location}</p>
								<span class="text-xs text-muted-foreground">{day.activities.length} activities</span
								>
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
	{/if}
</div>
