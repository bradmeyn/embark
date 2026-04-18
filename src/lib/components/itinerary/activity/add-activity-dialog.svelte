<script lang="ts">
	import Button, { buttonVariants } from '$ui/button/button.svelte';
	import * as Dialog from '$ui/dialog/index.js';
	import Input from '$ui/input/input.svelte';
	import * as Field from '$ui/field';
	import { addActivity, suggestActivityForDay } from '$lib/remotes/trips/activity.remote';
	import { getTrip } from '$lib/remotes/trips/trip.remote';
	import { getCurrentUser } from '$lib/remotes/auth/auth.remote';
	import Spinner from '$ui/spinner/spinner.svelte';
	import { Plus, Sparkles } from '@lucide/svelte';

	const user = $derived(await getCurrentUser());
	const isPro = $derived(user?.plan === 'pro');

	let {
		dayId,
		tripId,
		open = $bindable(false),
		showTrigger = true
	}: {
		dayId: string;
		tripId: string;
		open?: boolean;
		showTrigger?: boolean;
	} = $props();

	let suggestion = $state<Awaited<ReturnType<typeof suggestActivityForDay>>['suggestion'] | null>(null);
	let submitError = $state<string | null>(null);
</script>

<Dialog.Root bind:open>
	{#if showTrigger}
		<Dialog.Trigger
			class={buttonVariants({ variant: 'ghost', size: 'icon' })}
			aria-label="Add activity"
		>
			<Plus />
		</Dialog.Trigger>
	{/if}

	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add an Activity</Dialog.Title>
			<Dialog.Description>Provide a name and optional details for this activity.</Dialog.Description
			>
		</Dialog.Header>

		{#each addActivity.fields.issues() as issue (issue.message)}
			<p class="text-sm text-red-600">{issue.message}</p>
		{/each}
		{#if submitError}
			<p class="text-sm text-destructive">{submitError}</p>
		{/if}

		<form
			{...addActivity.for(dayId).enhance(async ({ form, submit }) => {
				submitError = null;
				try {
					await submit().updates(getTrip(tripId));
					form.reset();
					suggestion = null;
					open = false;
				} catch (e) {
					console.error('Error adding activity', e);
					submitError = 'Failed to add activity. Please try again.';
				}
			})}
			class="space-y-3"
		>
			{#if isPro}
				<div class="flex justify-end">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={async () => {
							const result = await suggestActivityForDay({ dayId });
							suggestion = result.suggestion;
						}}
						disabled={!!suggestActivityForDay.pending}
					>
						{#if suggestActivityForDay.pending}
							<Spinner class="size-4" />
						{:else}
							<Sparkles class="size-3.5" />
							Suggest with AI
						{/if}
					</Button>
				</div>
			{/if}

			<Field.Field>
				<Field.Label for="name">Name</Field.Label>
				<Input
					id="name"
					{...addActivity.fields.name.as('text')}
					value={suggestion?.name ?? ''}
					autocomplete="off"
					placeholder="e.g., Morning Hike"
				/>
				<Field.Error />
			</Field.Field>

			<Field.Field>
				<Field.Label for="description">Description</Field.Label>
				<textarea
					id="description"
					{...addActivity.fields.description.as('text')}
					value={suggestion?.description ?? ''}
					rows="3"
					class="w-full rounded-md border p-2"
				></textarea>
				<Field.Error />
			</Field.Field>

			<div class="grid grid-cols-2 gap-2">
				<Field.Field>
					<Field.Label for="startTime">Start time</Field.Label>
					<Input
						id="startTime"
						{...addActivity.fields.startTime.as('text')}
						value={suggestion?.startTime ?? ''}
						type="time"
						step="60"
						class="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
					/>
					<Field.Error />
				</Field.Field>

				<Field.Field>
					<Field.Label for="cost">Cost</Field.Label>
					<Input
						id="cost"
						{...addActivity.fields.cost.as('number')}
						value={suggestion?.cost?.replace(/[^\d.]/g, '') ?? ''}
						min="0"
						step="0.01"
					/>
					<Field.Error />
				</Field.Field>
			</div>

			<Field.Field>
				<Field.Label for="location">Location</Field.Label>
				<Input
					id="location"
					{...addActivity.fields.location.as('text')}
					value={suggestion?.location ?? ''}
					placeholder="Optional location"
				/>
				<Field.Error />
			</Field.Field>

			<input type="hidden" name="dayId" value={dayId} />

			<div class="mt-4 flex justify-end">
				<Dialog.Footer>
					<Button type="submit" disabled={!!addActivity.pending}>
						{#if addActivity.pending}
							<Spinner class="size-4" />
						{:else}
							Add Activity
						{/if}
					</Button>
					<Button type="button" variant="outline" onclick={() => (open = false)}>Cancel</Button>
				</Dialog.Footer>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
