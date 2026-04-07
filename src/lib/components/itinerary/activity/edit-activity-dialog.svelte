<script lang="ts">
	import Button from '$ui/button/button.svelte';
	import * as Dialog from '$ui/dialog/index.js';
	import Input from '$ui/input/input.svelte';
	import * as Field from '$ui/field';
	import { editActivity } from '$lib/remotes/trips/activity.remote';
	import { getTrip } from '$lib/remotes/trips/trip.remote';
	import Spinner from '$ui/spinner/spinner.svelte';
	import type { Activity } from '$db/schemas/itinerary';

	let {
		activity,
		tripId,
		open = $bindable(false),
		showTrigger = true
	}: {
		activity: Activity;
		tripId: string;
		open?: boolean;
		showTrigger?: boolean;
	} = $props();

	const activityForm = $derived(editActivity.for(activity.id));

	function formatTimeValue(value?: Date | string | null): string {
		if (!value) return '';
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return '';
		const h = String(date.getUTCHours()).padStart(2, '0');
		const m = String(date.getUTCMinutes()).padStart(2, '0');
		return `${h}:${m}`;
	}
</script>

<Dialog.Root bind:open>
	{#if showTrigger}
		<Dialog.Trigger class="flex items-center gap-2">Edit Activity</Dialog.Trigger>
	{/if}

	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit Activity</Dialog.Title>
			<Dialog.Description>Update the activity details.</Dialog.Description>
		</Dialog.Header>

		{#each activityForm.fields.issues() as issue (issue)}
			<p class="text-sm text-red-600">{issue.message}</p>
		{/each}

		<form
			{...activityForm.enhance(async ({ submit }) => {
				try {
					await submit().updates(getTrip(tripId));
					open = false;
				} catch (e) {
					console.error('Error editing activity', e);
				}
			})}
			class="space-y-3"
		>
			<input type="hidden" name="id" value={activity.id} />

			<Field.Field>
				<Field.Label for="name">Name</Field.Label>
				<Input
					id="name"
					{...activityForm.fields.name.as('text')}
					autocomplete="off"
					placeholder="e.g., Morning Hike"
					value={activity.name}
				/>
				<Field.Error />
			</Field.Field>

			<Field.Field>
				<Field.Label for="description">Description</Field.Label>
				<textarea
					id="description"
					{...activityForm.fields.description.as('text')}
					rows="3"
					class="w-full rounded-md border p-2"
				>{activity.description ?? ''}</textarea>
				<Field.Error />
			</Field.Field>

			<div class="grid grid-cols-2 gap-2">
				<Field.Field>
					<Field.Label for="startTime">Start time</Field.Label>
					<Input
						id="startTime"
						{...activityForm.fields.startTime.as('text')}
						type="time"
						step="60"
						value={formatTimeValue(activity.time)}
						class="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
					/>
					<Field.Error />
				</Field.Field>

				<Field.Field>
					<Field.Label for="cost">Cost</Field.Label>
					<Input
						id="cost"
						{...activityForm.fields.cost.as('number')}
						min="0"
						step="0.01"
						value={activity.cost ?? ''}
					/>
					<Field.Error />
				</Field.Field>
			</div>

			<Field.Field>
				<Field.Label for="location">Location</Field.Label>
				<Input
					id="location"
					{...activityForm.fields.location.as('text')}
					placeholder="Optional location"
					value={activity.location ?? ''}
				/>
				<Field.Error />
			</Field.Field>

			<div class="flex justify-end gap-2">
				<Dialog.Footer>
					<Button type="submit" disabled={!!activityForm.pending}>
						{#if activityForm.pending}
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
