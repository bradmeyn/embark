<script lang="ts">
	import Button from '$ui/button/button.svelte';
	import * as Dialog from '$ui/dialog/index.js';
	import Input from '$ui/input/input.svelte';
	import * as Field from '$ui/field';
	import { editDay } from '$lib/remotes/day.remote';
	import { getItinerary } from '$lib/remotes/itinerary.remote';
	import Spinner from '$ui/spinner/spinner.svelte';
	import type { Day } from '$db/schemas/itinerary';

	let {
		day,
		itineraryId,
		open = $bindable(false),
		showTrigger = true
	}: {
		day: Day;
		itineraryId: string;
		open?: boolean;
		showTrigger?: boolean;
	} = $props();

	const dayForm = $derived(editDay.for(day.id));

	async function onSubmitEnhance({ submit }: any) {
		try {
			await submit().updates(getItinerary(itineraryId));
			if (dayForm.result?.success) {
				open = false;
			}
		} catch (e) {
			console.error('Error editing day', e);
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

			<Field.Field>
				<Field.Label for="location">Location</Field.Label>
				<Input
					id="location"
					{...dayForm.fields.location.as('text')}
					autocomplete="off"
					placeholder="e.g., Tokyo, Paris, New York"
					value={day.location}
				/>
				<Field.Error />
			</Field.Field>

			<Field.Field>
				<Field.Label for="overview">Overview (optional)</Field.Label>
				<textarea
					id="overview"
					{...dayForm.fields.overview.as('text')}
					rows="2"
					class="w-full rounded-md border p-2"
					placeholder="Brief description of this day...">{day.overview ?? ''}</textarea
				>
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
