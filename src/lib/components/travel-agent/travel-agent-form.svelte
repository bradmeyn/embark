<script lang="ts">
	import Button from '$ui/button/button.svelte';
	import Input from '$ui/input/input.svelte';
	import * as Field from '$ui/field';
	import * as Select from '$ui/select';
	import Spinner from '$ui/spinner/spinner.svelte';
	import { generateTripDraft } from '$lib/remotes/travel-agent/travel-agent.remote';

	const styleOptions = ['Relaxed', 'Adventure', 'Food-focused', 'Luxury', 'Family'];
	const paceOptions = ['Slow', 'Balanced', 'Packed'];

	let styleValue = $state('');
	let paceValue = $state('');

	const draft = $derived(generateTripDraft.result?.draft ?? null);
</script>

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
			<Field.Label>Style</Field.Label>
			<Select.Root type="single" name="style" bind:value={styleValue} required>
				<Select.Trigger class="w-full">
					<span data-slot="select-value" class={styleValue ? '' : 'text-muted-foreground'}>
						{styleValue || 'Choose style'}
					</span>
				</Select.Trigger>
				<Select.Content>
					{#each styleOptions as option (option)}
						<Select.Item value={option} label={option} />
					{/each}
				</Select.Content>
			</Select.Root>
			<Field.Error errors={generateTripDraft.fields.style.issues()} />
		</Field.Field>

		<Field.Field>
			<Field.Label>Pace</Field.Label>
			<Select.Root type="single" name="pace" bind:value={paceValue} required>
				<Select.Trigger class="w-full">
					<span data-slot="select-value" class={paceValue ? '' : 'text-muted-foreground'}>
						{paceValue || 'Choose pace'}
					</span>
				</Select.Trigger>
				<Select.Content>
					{#each paceOptions as option (option)}
						<Select.Item value={option} label={option} />
					{/each}
				</Select.Content>
			</Select.Root>
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
