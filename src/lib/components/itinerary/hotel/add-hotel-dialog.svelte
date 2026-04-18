<script lang="ts">
	import Button, { buttonVariants } from '$ui/button/button.svelte';
	import * as Dialog from '$ui/dialog/index.js';
	import Input from '$ui/input/input.svelte';
	import * as Field from '$ui/field';
	import { addHotel, suggestHotelForDay } from '$lib/remotes/trips/hotel.remote';
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

	let suggestion = $state<Awaited<ReturnType<typeof suggestHotelForDay>>['suggestion'] | null>(null);
	let submitError = $state<string | null>(null);
</script>

<Dialog.Root bind:open>
	{#if showTrigger}
		<Dialog.Trigger
			class={buttonVariants({ variant: 'outline', size: 'sm' })}
			aria-label="Add hotel"
		>
			<Plus class="mr-1.5 size-3.5" />
			Add Hotel
		</Dialog.Trigger>
	{/if}

	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add Accommodation</Dialog.Title>
			<Dialog.Description>Add hotel or accommodation details for this day.</Dialog.Description>
		</Dialog.Header>

		{#each addHotel.fields.issues() as issue (issue.message)}
			<p class="text-sm text-red-600">{issue.message}</p>
		{/each}
		{#if submitError}
			<p class="text-sm text-destructive">{submitError}</p>
		{/if}

		<form
			{...addHotel.for(dayId).enhance(async ({ form, submit }) => {
				submitError = null;
				try {
					await submit().updates(getTrip(tripId));
					form.reset();
					suggestion = null;
					open = false;
				} catch (e) {
					console.error('Error adding hotel', e);
					submitError = 'Failed to add accommodation. Please try again.';
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
							const result = await suggestHotelForDay({ dayId });
							suggestion = result.suggestion;
						}}
						disabled={!!suggestHotelForDay.pending}
					>
						{#if suggestHotelForDay.pending}
							<Spinner class="size-4" />
						{:else}
							<Sparkles class="size-3.5" />
							Suggest with AI
						{/if}
					</Button>
				</div>
			{/if}

			<Field.Field>
				<Field.Label for="name">Hotel Name</Field.Label>
				<Input
					id="name"
					{...addHotel.fields.name.as('text')}
					value={suggestion?.name ?? ''}
					autocomplete="off"
					placeholder="e.g., Grand Hyatt Tokyo"
				/>
				<Field.Error />
			</Field.Field>

			<Field.Field>
				<Field.Label for="address">Address</Field.Label>
				<Input
					id="address"
					{...addHotel.fields.address.as('text')}
					value={suggestion?.address ?? ''}
					placeholder="Optional address"
				/>
				<Field.Error />
			</Field.Field>

			<div class="grid grid-cols-2 gap-2">
				<Field.Field>
					<Field.Label for="nights">Nights</Field.Label>
					<Input
						id="nights"
						{...addHotel.fields.nights.as('number')}
						value={suggestion?.nights ?? ''}
						min="1"
						step="1"
						placeholder="1"
					/>
					<Field.Error />
				</Field.Field>

				<Field.Field>
					<Field.Label for="cost">Total Cost</Field.Label>
					<Input
						id="cost"
						{...addHotel.fields.cost.as('number')}
						value={suggestion?.cost?.replace(/[^\d.]/g, '') ?? ''}
						min="0"
						step="0.01"
					/>
					<Field.Error />
				</Field.Field>
			</div>

			<div class="grid grid-cols-2 gap-2">
				<Field.Field>
					<Field.Label for="confirmationNumber">Confirmation #</Field.Label>
					<Input
						id="confirmationNumber"
						{...addHotel.fields.confirmationNumber.as('text')}
						placeholder="Optional"
					/>
					<Field.Error />
				</Field.Field>
			</div>

			<Field.Field>
				<Field.Label for="notes">Notes</Field.Label>
				<textarea
					id="notes"
					{...addHotel.fields.notes.as('text')}
					value={suggestion?.notes ?? ''}
					rows="2"
					class="w-full rounded-md border p-2"
					placeholder="Any additional notes..."
				></textarea>
				<Field.Error />
			</Field.Field>

			<input type="hidden" name="dayId" value={dayId} />

			<div class="mt-4 flex justify-end">
				<Dialog.Footer>
					<Button type="submit" disabled={!!addHotel.pending}>
						{#if addHotel.pending}
							<Spinner class="size-4" />
						{:else}
							Add Hotel
						{/if}
					</Button>
				</Dialog.Footer>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
