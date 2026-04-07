<script lang="ts">
	import type { Activity } from '$db/schemas/itinerary';
	import { deleteActivity } from '$lib/remotes/trips/activity.remote';
	import { DollarSign, MapPin, Pencil, Trash2 } from '@lucide/svelte';
	import DeleteDialog from '../../delete-dialog.svelte';
	import EditActivityDialog from './edit-activity-dialog.svelte';
	import { getTrip } from '$lib/remotes/trips/trip.remote';
	import Button from '$ui/button/button.svelte';

	let {
		activity,
		tripId
	}: {
		activity: Activity;
		tripId: string;
	} = $props();

	let deleteDialogOpen = $state(false);
	let editDialogOpen = $state(false);
	let deleteError = $state<string | null>(null);

	const timeFormatter = new Intl.DateTimeFormat(undefined, {
		hour: 'numeric',
		minute: '2-digit'
	});

	function formatTime(value?: Date | string | null) {
		if (!value) return null;
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) {
			return null;
		}
		return timeFormatter.format(date);
	}

	async function handleDeleteActivity(activityId: string) {
		deleteError = null;
		try {
			await deleteActivity({ activityId }).updates(getTrip(tripId));
		} catch (e) {
			console.error('Error deleting activity', e);
			deleteError = 'Failed to delete activity. Please try again.';
		}
	}
</script>

<li class="flex items-start justify-between border-b py-2 last:border-0">
	<div>
		<p class="text-xs text-muted-foreground">
			{formatTime(activity.time) ?? 'Anytime'}
		</p>
		<h3 class="font-medium text-foreground">{activity.name}</h3>
		{#if activity.description}
			<p class="mt-1 text-sm text-muted-foreground">{activity.description}</p>
		{/if}

		<div class="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
			{#if activity.location}
				<div class="flex items-center gap-1 rounded-full border px-3 py-1">
					<MapPin class="size-3 text-primary" />
					<span class="rounded-full bg-background/80">{activity.location}</span>
				</div>
			{/if}
			{#if activity.cost}
				<div class="flex items-center gap-1 rounded-full border px-3 py-1">
					<DollarSign class="size-3 text-primary" />
					<span class="rounded-full bg-background/80">{activity.cost}</span>
				</div>
			{/if}
		</div>

		{#if deleteError}
			<p class="mt-1 text-xs text-destructive">{deleteError}</p>
		{/if}
	</div>
	<div class="flex shrink-0 gap-1">
		<Button
			variant="ghost"
			size="icon"
			class="size-8"
			onclick={() => (editDialogOpen = true)}
			aria-label="Edit activity"
		>
			<Pencil class="size-3.5" />
		</Button>
		<Button
			variant="ghost"
			size="icon"
			class="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
			onclick={() => (deleteDialogOpen = true)}
			aria-label="Delete activity"
		>
			<Trash2 class="size-4" />
		</Button>
	</div>
</li>

<EditActivityDialog {activity} {tripId} bind:open={editDialogOpen} showTrigger={false} />
<DeleteDialog
	label="activity"
	onDelete={() => handleDeleteActivity(activity.id)}
	bind:open={deleteDialogOpen}
	showTrigger={false}
/>
