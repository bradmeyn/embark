<script lang="ts">
	import Button from '$ui/button/button.svelte';
	import Input from '$ui/input/input.svelte';
	import * as Field from '$ui/field';
	import { addDays } from '$lib/remotes/day.remote';
	import Spinner from '$ui/spinner/spinner.svelte';

	import { Plus, Trash } from '@lucide/svelte';

	let {
		tripId
	}: {
		tripId: string;
	} = $props();

	let days = $state([0, 1, 2]);

	function addMore() {
		days = [...days, days.length];
	}

	function removeAt(index: number) {
		if (days.length <= 1) return;
		days = days.filter((_, i) => i !== index);
	}
</script>

<div class="space-y-6 rounded-xl">
	<header class="space-y-2">
		<h1 class="heading-1">Get started</h1>
		<p class=" text-muted-foreground">Add days to your itinerary to begin planning your trip.</p>

		{#each addDays.fields.issues() as issue}
			<p class="text-sm text-red-600">{issue.message}</p>
		{/each}
	</header>

	<form {...addDays} class="space-y-3">
		{#each days as _, i (i)}
			<div class="group rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
				<div class="flex items-center gap-3">
					<div
						class="flex size-10 flex-col items-center justify-center rounded-lg border bg-muted/80 p-8 font-serif"
					>
						<span>Day</span>
						<span class="text-lg text-primary">{i + 1}</span>
					</div>

					<Field.Field class="flex-1">
						<Field.Label for={`days-${i}-location`} class="text-xs font-medium text-gray-700">
							Location
						</Field.Label>
						<Input
							{...addDays.fields.days[i].location.as('text')}
							placeholder="e.g., Tokyo, Paris, New York"
							disabled={!!addDays.pending}
							class="placeholder:text-gray-400"
						/>
						<Field.Error />
					</Field.Field>

					<Button
						size="icon-sm"
						onclick={() => removeAt(i)}
						disabled={!!addDays.pending || days.length <= 1}
						variant="ghost"
					>
						<Trash class="h-4 w-4" />
					</Button>
				</div>

				<!-- hidden fields -->
				<input {...addDays.fields.days[i].dayNumber.as('number')} class="hidden" value={i + 1} />
				<input type="hidden" name={`days[${i}].tripId`} value={tripId} />
			</div>
		{/each}

		<div class="flex items-center justify-between pt-2">
			<Button
				size="sm"
				onclick={addMore}
				disabled={!!addDays.pending}
				variant="outline"
				class="gap-2 border-orange-200 text-primary hover:bg-orange-50"
			>
				<Plus class="h-4 w-4" />
				Add Day
			</Button>

			<Button type="submit" disabled={!!addDays.pending}>
				{#if addDays.pending}
					<Spinner class="size-4" />
				{:else}
					Add Days
				{/if}
			</Button>
		</div>
	</form>
</div>
