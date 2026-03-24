<script lang="ts">
	import GlobeLoader from '$lib/components/travel-agent/globe-loader.svelte';
	import TravelAgentForm from '$lib/components/travel-agent/travel-agent-form.svelte';
	import ItineraryPreview from '$lib/components/travel-agent/itinerary-preview.svelte';
	import { generateTripDraft } from '$lib/remotes/travel-agent/travel-agent.remote';

	const draft = $derived(generateTripDraft.result?.draft ?? null);
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
		<TravelAgentForm />
	</section>

	{#if generateTripDraft.pending}
		<section class="mt-6 rounded-xl border bg-card p-6 shadow-sm">
			<GlobeLoader label="Building your day-by-day plan..." />
		</section>
	{:else if draft}
		<div class="mt-6">
			<ItineraryPreview />
		</div>
	{/if}
</div>
