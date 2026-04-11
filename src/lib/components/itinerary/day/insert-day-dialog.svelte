<script lang="ts">
	import Button from '$ui/button/button.svelte';
	import * as Dialog from '$ui/dialog/index.js';
	import Input from '$ui/input/input.svelte';
	import * as Field from '$ui/field';
	import Spinner from '$ui/spinner/spinner.svelte';
	import { insertDay } from '$lib/remotes/trips/day.remote';
	import { suggestNewDayForTrip } from '$lib/remotes/trips/day.remote';
	import { Sparkles } from '@lucide/svelte';

	let {
		tripId,
		atPosition,
		open = $bindable(false),
		showTrigger = false
	}: {
		tripId: string;
		atPosition: number;
		open?: boolean;
		showTrigger?: boolean;
	} = $props();

	let location = $state('');
	let suggesting = $state(false);
	let submitError = $state<string | null>(null);

	async function suggestLocation() {
		suggesting = true;
		try {
			const result = await suggestNewDayForTrip({ tripId, dayNumber: atPosition });
			if (result.suggestion?.location) {
				location = result.suggestion.location;
			}
		} catch (e) {
			console.error('Error suggesting location', e);
		} finally {
			suggesting = false;
		}
	}
</script>

<Dialog.Root bind:open>
	{#if showTrigger}
		<Dialog.Trigger>Insert Day</Dialog.Trigger>
	{/if}

	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Insert Day {atPosition}</Dialog.Title>
			<Dialog.Description>
				A new day will be inserted at position {atPosition}. Existing days from {atPosition} onwards
				will shift down.
			</Dialog.Description>
		</Dialog.Header>

		{#each insertDay.fields.issues() as issue (issue.message)}
			<p class="text-sm text-red-600">{issue.message}</p>
		{/each}
		{#if submitError}
			<p class="text-sm text-destructive">{submitError}</p>
		{/if}

		<form
			{...insertDay.enhance(async ({ form, submit }) => {
				submitError = null;
				try {
					await submit().updates(getTrip(tripId));
					form.reset();
					location = '';
					open = false;
				} catch (e) {
					console.error('Error inserting day', e);
					submitError = 'Failed to insert day. Please try again.';
				}
			})}
			class="space-y-4"
		>
			<Field.Field>
				<Field.Label for="location">Location</Field.Label>
				<div class="flex gap-2">
					<Input
						id="location"
						{...insertDay.fields.location.as('text')}
						bind:value={location}
						placeholder="e.g., Tokyo, Paris, New York"
						disabled={!!insertDay.pending}
						class="flex-1"
					/>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={suggestLocation}
						disabled={!!insertDay.pending || suggesting}
					>
						{#if suggesting}
							<Spinner class="size-4" />
						{:else}
							<Sparkles class="size-3.5" />
						{/if}
					</Button>
				</div>
				<Field.Error />
			</Field.Field>

			<input type="hidden" name="tripId" value={tripId} />
			<input {...insertDay.fields.atPosition.as('number')} type="hidden" value={atPosition} />

			<Dialog.Footer>
				<Button type="submit" disabled={!!insertDay.pending}>
					{#if insertDay.pending}
						<Spinner class="size-4" />
					{:else}
						Insert Day
					{/if}
				</Button>
				<Button type="button" variant="outline" onclick={() => (open = false)}>Cancel</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
