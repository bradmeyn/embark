<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Button from '$ui/button/button.svelte';
	import Input from '$ui/input/input.svelte';
	import * as Field from '$ui/field';
	import Spinner from '$ui/spinner/spinner.svelte';
	import GlobeLoader from '$lib/components/trip/globe-loader.svelte';
	import ItineraryMap from '$lib/components/itinerary/itinerary-map.svelte';
	import type { DayWithActivities } from '$db/schemas/itinerary';
	import {
		generateTripDraft,
		saveGeneratedTrip,
		type GeneratedTripDraft,
		type TripAgentInput
	} from '$lib/remotes/travel-agent.remote';

	type PreviewDay = GeneratedTripDraft['days'][number] & {
		latitude?: number | null;
		longitude?: number | null;
	};

	let formState = $state<TripAgentInput>({
		destinations: '',
		numberOfDays: 7,
		budget: '',
		style: '',
		pace: '',
		interests: ''
	});

	let draft = $state<GeneratedTripDraft | null>(null);
	let generating = $state(false);
	let saving = $state(false);
	let errorMessage = $state('');
	let hasGenerated = $state(false);

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

	async function onGenerate(event: SubmitEvent) {
		event.preventDefault();
		errorMessage = '';
		generating = true;
		hasGenerated = true;

		try {
			const result = await generateTripDraft({ input: formState });
			draft = result.draft ?? null;
			if (!draft) {
				errorMessage = 'No itinerary was generated. Please try again.';
			}
		} catch {
			errorMessage = 'Unable to generate itinerary right now. Please try again.';
		} finally {
			generating = false;
		}
	}

	async function onSave() {
		if (!draft) return;
		errorMessage = '';
		saving = true;

		try {
			const result = await saveGeneratedTrip({ draft });
			if (result.tripId) {
				await goto(resolve(`/trips/${result.tripId}`));
				return;
			}
			errorMessage = 'Trip was saved, but redirect failed. Please refresh your trips list.';
		} catch {
			errorMessage = 'Unable to save generated trip. Please try again.';
		} finally {
			saving = false;
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

	<section
		class="rounded-xl border bg-card p-4 shadow-sm {hasGenerated ? '' : 'mx-auto max-w-3xl'}"
	>
		<form class="space-y-3" onsubmit={onGenerate}>
			<div class="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
				<Field.Field class="lg:col-span-2">
					<Field.Label for="destinations">Destination(s)</Field.Label>
					<Input
						id="destinations"
						bind:value={formState.destinations}
						placeholder="Tokyo + Kyoto"
						required
					/>
				</Field.Field>

				<Field.Field>
					<Field.Label for="numberOfDays">Days</Field.Label>
					<Input
						id="numberOfDays"
						type="number"
						bind:value={formState.numberOfDays}
						min="1"
						max="30"
						required
					/>
				</Field.Field>

				<Field.Field>
					<Field.Label for="budget">Budget</Field.Label>
					<Input id="budget" bind:value={formState.budget} placeholder="~ $3500" required />
				</Field.Field>

				<Field.Field>
					<Field.Label for="style">Style</Field.Label>
					<select
						id="style"
						bind:value={formState.style}
						class="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
						required
					>
						<option value="" disabled>Choose style</option>
						{#each styleOptions as option (option)}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</Field.Field>

				<Field.Field>
					<Field.Label for="pace">Pace</Field.Label>
					<select
						id="pace"
						bind:value={formState.pace}
						class="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
						required
					>
						<option value="" disabled>Choose pace</option>
						{#each paceOptions as option (option)}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</Field.Field>

				<Field.Field class="md:col-span-2 lg:col-span-6">
					<Field.Label for="interests">Interests</Field.Label>
					<Input
						id="interests"
						bind:value={formState.interests}
						placeholder="Food, temples, nightlife, design"
						required
					/>
				</Field.Field>
			</div>

			<div class="flex items-center justify-between gap-3 pt-1">
				<p class="text-xs text-muted-foreground">Flights are intentionally excluded for now.</p>
				<Button type="submit" disabled={generating}>
					{#if generating}
						<Spinner class="size-4" />
					{:else if hasGenerated}
						Regenerate
					{:else}
						Generate itinerary
					{/if}
				</Button>
			</div>
		</form>
	</section>

	{#if errorMessage}
		<p
			class="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
		>
			{errorMessage}
		</p>
	{/if}

	{#if generating}
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
					<Button onclick={onSave} disabled={saving}>
						{#if saving}
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
