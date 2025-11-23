<script lang="ts">
	import Button from '$ui/button/button.svelte';
	import * as Dialog from '$ui/dialog/index.js';
	import Input from '$ui/input/input.svelte';
	import * as Field from '$ui/field';
	import { addItinerary } from '$lib/remotes/itinerary.remote';
	import Spinner from '$ui/spinner/spinner.svelte';
	import { Plus } from '@lucide/svelte';

	let { tripId }: { tripId: string } = $props();

	let isOpen = $state(false);
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Trigger class="flex items-center gap-2">
		{#snippet child()}
			<Plus class="size-4" />
			<span>Add Itinerary</span>
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Create a New Itinerary</Dialog.Title>
			<Dialog.Description>Please provide a name for your itinerary.</Dialog.Description>
		</Dialog.Header>

		<form
			{...addItinerary.for(tripId).enhance(async ({ form, submit }) => {
				try {
					await submit();
					form.reset();

					if (addItinerary.result?.success) {
						isOpen = false;
					}
				} catch (error) {
					console.error('Error creating itinerary:', error);
				}
			})}
		>
			<Field.Field>
				<Field.Label for="name">Itinerary Name</Field.Label>
				<Input
					id="name"
					{...addItinerary.fields.name.as('text')}
					autocomplete="off"
					placeholder="Tokyo & Kyoto"
					disabled={!!addItinerary.pending}
				/>
				<Field.Error />
				{#each addItinerary.fields.name.issues() as issue}
					<Field.Error>{issue.message}</Field.Error>
				{/each}
			</Field.Field>

			<input type="hidden" name="tripId" value={tripId} />

			<div class="mt-4 flex justify-end">
				<Dialog.Footer>
					<Button type="submit" disabled={!!addItinerary.pending}>
						{#if addItinerary.pending}
							<Spinner class="size-4" />
						{:else}
							Create Itinerary
						{/if}
					</Button>
					<Button type="button" variant="outline" onclick={() => (isOpen = false)}>Cancel</Button>
				</Dialog.Footer>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
