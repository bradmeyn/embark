<script lang="ts">
	import type { Activity } from '$db/schemas/itinerary';
	import { deleteActivity } from '$lib/remotes/activity.remote';
	import { DollarSign, MapPin, Trash2 } from '@lucide/svelte';
	import DeleteDialog from '../delete-dialog.svelte';
	import { getTrip } from '$lib/remotes/trip.remote';
	import Button from '$ui/button/button.svelte';

	let {
		activity,
		tripId
	}: {
		activity: Activity;
		tripId: string;
	} = $props();

	let deleteDialogOpen = $state(false);

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
		try {
			await deleteActivity({ activityId }).updates(getTrip(tripId));
		} finally {
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
	</div>
	<Button variant="ghost" size="sm" onclick={() => (deleteDialogOpen = true)}>
		<Trash2 class="size-4" />
	</Button>
</li>

<DeleteDialog
	label="activity"
	onDelete={() => handleDeleteActivity(activity.id)}
	bind:open={deleteDialogOpen}
	showTrigger={false}
/>
