<script lang="ts">
	import Button, { buttonVariants } from '$ui/button/button.svelte';
	import * as Dialog from '$ui/dialog/index.js';
	import Input from '$ui/input/input.svelte';
	import * as Field from '$ui/field';
	import Spinner from '$ui/spinner/spinner.svelte';
	import { insertDay, suggestNewDayForTrip } from '$lib/remotes/trips/day.remote';
	import { getTrip } from '$lib/remotes/trips/trip.remote';
	import { getCurrentUser } from '$lib/remotes/auth/auth.remote';
	import { Plus, Sparkles } from '@lucide/svelte';
	import type { DayWithActivities } from '$db/schemas/itinerary';

	const user = $derived(await getCurrentUser());
	const isPro = $derived(user?.plan === 'pro');

	let {
		tripId,
		nextDayNumber,
		days = [],
		open = $bindable(false),
		showTrigger = true
	}: {
		tripId: string;
		nextDayNumber: number;
		days?: DayWithActivities[];
		open?: boolean;
		showTrigger?: boolean;
	} = $props();

	let location = $state('');
	let selectedPosition = $state(nextDayNumber);
	let suggesting = $state(false);
	let submitError = $state<string | null>(null);

	$effect(() => {
		if (open) {
			selectedPosition = nextDayNumber;
			location = '';
			submitError = null;
		}
	});

	async function suggestLocation() {
		suggesting = true;
		try {
			const result = await suggestNewDayForTrip({ tripId, dayNumber: selectedPosition });
			if (result.suggestion?.location) location = result.suggestion.location;
		} catch (e) {
			console.error('Error suggesting location', e);
		} finally {
			suggesting = false;
		}
	}

	const positionLabel = $derived(
		selectedPosition === nextDayNumber
			? days.length === 0
				? 'Adding as Day 1'
				: `Adding as Day ${nextDayNumber} (end of trip)`
			: `Inserting before Day ${selectedPosition} — existing days shift down`
	);
</script>

<Dialog.Root bind:open>
	{#if showTrigger}
		<Dialog.Trigger class={buttonVariants({ variant: 'default', size: 'sm' })}>
			<Plus class="size-4" />
			Add a Day
		</Dialog.Trigger>
	{/if}

	<Dialog.Content class={days.length > 0 ? 'sm:max-w-2xl' : ''}>
		<Dialog.Header>
			<Dialog.Title>Add a Day</Dialog.Title>
			<Dialog.Description>
				{days.length > 0
					? 'Choose where to insert the new day in your itinerary.'
					: 'Add your first day to get started.'}
			</Dialog.Description>
		</Dialog.Header>

		<div class="flex gap-6">
			{#if days.length > 0}
				<!-- Timeline -->
				<div class="w-44 shrink-0">
					<p class="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
						Position
					</p>
					<div class="relative">
						{#each days as day, i (day.id)}
							<!-- Insertion point before this day -->
							<button
								type="button"
								onclick={() => (selectedPosition = day.dayNumber)}
								class="group relative z-10 flex w-full items-center gap-2 py-0.5"
							>
								<div
									class="flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-all {selectedPosition ===
									day.dayNumber
										? 'border-primary bg-primary text-primary-foreground scale-110'
										: 'border-border bg-background text-muted-foreground group-hover:border-primary/50 group-hover:bg-primary/5'}"
								>
									<Plus class="size-2.5" />
								</div>
								<span
									class="truncate text-xs transition-colors {selectedPosition === day.dayNumber
										? 'font-medium text-primary'
										: 'text-transparent group-hover:text-muted-foreground'}"
								>
									Before Day {day.dayNumber}
								</span>
							</button>

							<!-- Day item -->
							<div class="flex items-center gap-2 py-1.5 pl-0.5">
								<div
									class="flex size-4 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground ring-1 ring-border"
								>
									{day.dayNumber}
								</div>
								<span class="truncate text-xs text-foreground">{day.location}</span>
							</div>

							{#if i < days.length - 1}
								<div class="ml-2 h-1 w-px bg-border"></div>
							{/if}
						{/each}

						<!-- Insertion point at end -->
						<button
							type="button"
							onclick={() => (selectedPosition = nextDayNumber)}
							class="group relative z-10 flex w-full items-center gap-2 py-0.5"
						>
							<div
								class="flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-all {selectedPosition ===
								nextDayNumber
									? 'border-primary bg-primary text-primary-foreground scale-110'
									: 'border-border bg-background text-muted-foreground group-hover:border-primary/50 group-hover:bg-primary/5'}"
							>
								<Plus class="size-2.5" />
							</div>
							<span
								class="truncate text-xs transition-colors {selectedPosition === nextDayNumber
									? 'font-medium text-primary'
									: 'text-muted-foreground/50 group-hover:text-muted-foreground'}"
							>
								Add to end
							</span>
						</button>
					</div>
				</div>

				<div class="w-px shrink-0 bg-border"></div>
			{/if}

			<!-- Form -->
			<div class="flex-1 min-w-0">
				<p class="mb-4 text-sm text-muted-foreground">{positionLabel}</p>

				{#each insertDay.fields.issues() as issue (issue.message)}
					<p class="mb-2 text-sm text-destructive">{issue.message}</p>
				{/each}
				{#if submitError}
					<p class="mb-2 text-sm text-destructive">{submitError}</p>
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
							console.error('Error adding day', e);
							submitError = 'Failed to add day. Please try again.';
						}
					})}
					class="space-y-4"
				>
					<input type="hidden" name="tripId" value={tripId} />
					<input {...insertDay.fields.atPosition.as('number')} type="hidden" value={selectedPosition} />

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
							{#if isPro}
								<Button
									type="button"
									variant="outline"
									size="sm"
									onclick={suggestLocation}
									disabled={!!insertDay.pending || suggesting}
									title="Suggest with AI"
								>
									{#if suggesting}
										<Spinner class="size-4" />
									{:else}
										<Sparkles class="size-4" />
										<span class="hidden sm:inline">Suggest</span>
									{/if}
								</Button>
							{/if}
						</div>
						{#each insertDay.fields.location.issues() as issue (issue.message)}
							<Field.Error>{issue.message}</Field.Error>
						{/each}
					</Field.Field>

					<Dialog.Footer>
						<Button type="submit" disabled={!!insertDay.pending}>
							{#if insertDay.pending}
								<Spinner class="size-4" />
							{:else}
								Add Day
							{/if}
						</Button>
						<Button type="button" variant="outline" onclick={() => (open = false)}>Cancel</Button>
					</Dialog.Footer>
				</form>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
