<script lang="ts">
	import Button from '$ui/button/button.svelte';
	import * as Dialog from '$ui/dialog/index.js';
	import Input from '$ui/input/input.svelte';
	import * as Field from '$ui/field';
	import { editDay } from '$lib/remotes/day.remote';
	import { suggestDayOverview } from '$lib/remotes/ai.remote';
	import { getTrip } from '$lib/remotes/trip.remote';
	import Spinner from '$ui/spinner/spinner.svelte';
	import type { Day } from '$db/schemas/itinerary';
	import { Sparkles } from '@lucide/svelte';

	let {
		day,
		tripId,
		open = $bindable(false),
		showTrigger = true
	}: {
		day: Day;
		tripId: string;
		open?: boolean;
		showTrigger?: boolean;
	} = $props();

	const dayForm = $derived(editDay.for(day.id));
	let location = $state(day.location);
	let overview = $state(day.overview ?? '');
	let suggesting = $state(false);

	$effect(() => {
		if (!open) return;
		location = day.location;
		overview = day.overview ?? '';
	});

	async function onSubmitEnhance({ submit }: any) {
		try {
			await submit().updates(getTrip(tripId));
			open = false;
		} catch (e) {
			console.error('Error editing day', e);
		}
	}

	async function suggestDay() {
		suggesting = true;
		try {
			const result = await suggestDayOverview({ dayId: day.id });
			const suggestion = result.suggestion;
			if (!suggestion) return;

			location = suggestion.location ?? location;
			overview = suggestion.overview ?? overview;
		} catch (e) {
			console.error('Error suggesting day details', e);
		} finally {
			suggesting = false;
		}
	}
</script>

<Dialog.Root bind:open>
	{#if showTrigger}
		<Dialog.Trigger class="flex items-center gap-2">Edit Day</Dialog.Trigger>
	{/if}

	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit Day {day.dayNumber}</Dialog.Title>
			<Dialog.Description>Update the location or overview for this day.</Dialog.Description>
		</Dialog.Header>

		{#each dayForm.fields.issues() as issue}
			<p class="text-sm text-red-600">{issue.message}</p>
		{/each}

		<form {...dayForm.enhance(onSubmitEnhance)} class="space-y-4">
			<input type="hidden" name="id" value={day.id} />

			<div class="flex justify-end">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onclick={suggestDay}
					disabled={suggesting}
				>
					{#if suggesting}
						<Spinner class="size-4" />
					{:else}
						<Sparkles class="size-3.5" />
						Suggest with AI
					{/if}
				</Button>
			</div>

			<Field.Field>
				<Field.Label for="location">Location</Field.Label>
				<Input
					id="location"
					{...dayForm.fields.location.as('text')}
					bind:value={location}
					autocomplete="off"
					placeholder="e.g., Tokyo, Paris, New York"
				/>
				<Field.Error />
			</Field.Field>

			<Field.Field>
				<Field.Label for="overview">Overview (optional)</Field.Label>
				<textarea
					id="overview"
					{...dayForm.fields.overview.as('text')}
					bind:value={overview}
					rows="2"
					class="w-full rounded-md border p-2"
					placeholder="Brief description of this day..."
				></textarea>
				<Field.Error />
			</Field.Field>

			<div class="flex justify-end">
				<Dialog.Footer>
					<Button type="submit" disabled={!!dayForm.pending}>
						{#if dayForm.pending}
							<Spinner class="size-4" />
						{:else}
							Save Changes
						{/if}
					</Button>
					<Button type="button" variant="outline" onclick={() => (open = false)}>Cancel</Button>
				</Dialog.Footer>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
