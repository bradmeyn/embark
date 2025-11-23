<script lang="ts">
	import Button, { buttonVariants } from '$ui/button/button.svelte';
	import * as Dialog from '$ui/dialog/index.js';
	import Input from '$ui/input/input.svelte';
	import * as Field from '$ui/field';
	import { addTrip } from '$lib/remotes/trip.remote';
	import Spinner from '$ui/spinner/spinner.svelte';

	let isOpen = $state(false);

	const submit = async ({
		form,
		submit
	}: {
		form: HTMLFormElement;
		submit: () => Promise<void>;
		data: { name: string };
	}) => {
		try {
			await submit();
			form.reset();

			if (addTrip.result?.success) {
				isOpen = false;
			}
		} catch (error) {
			console.error('Error creating trip:', error);
		}
	};
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Trigger class={buttonVariants({ variant: 'default' })} onclick={() => (isOpen = true)}
		>Create Trip</Dialog.Trigger
	>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Create a New Trip</Dialog.Title>
			<Dialog.Description>Please provide a name for your trip.</Dialog.Description>
		</Dialog.Header>

		<form {...addTrip.enhance(submit)}>
			<Field.Field>
				<Field.Label for="name">Trip Name</Field.Label>
				<Input
					id="name"
					{...addTrip.fields.name.as('text')}
					autocomplete="off"
					placeholder="Japan 2025"
					disabled={!!addTrip.pending}
				/>
				<Field.Error />
				{#each addTrip.fields.name.issues() as issue}
					<Field.Error>{issue.message}</Field.Error>
				{/each}
			</Field.Field>

			<div class="mt-4 flex justify-end">
				<Dialog.Footer>
					<Button type="submit" disabled={!!addTrip.pending}>
						{#if addTrip.pending}
							<Spinner class="size-4" />
						{:else}
							Create Trip
						{/if}
					</Button>
					<Button type="button" variant="outline" onclick={() => (isOpen = false)}>Cancel</Button>
				</Dialog.Footer>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
