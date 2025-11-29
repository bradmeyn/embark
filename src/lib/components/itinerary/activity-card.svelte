<script lang="ts">
	import type { Activity } from '$db/schemas/itinerary';
	import { deleteActivity } from '$lib/remotes/activity.remote';
	import { DollarSign, MapPin, Trash2 } from '@lucide/svelte';
	import DeleteDialog from '../delete-dialog.svelte';
	import { Clock3 } from '@lucide/svelte';
	import { getItinerary } from '$lib/remotes/itinerary.remote';
	import Button from '$ui/button/button.svelte';

	let {
		activity,
		itineraryId
	}: {
		activity: Activity;
		itineraryId: string;
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
			await deleteActivity({ activityId }).updates(getItinerary(itineraryId));
		} finally {
		}
	}
</script>

<li class="card flex items-start justify-between p-4 shadow-sm">
	<div>
		<p
			class="flex items-center gap-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
		>
			<Clock3 class="size-3" />
			{formatTime(activity.time) ?? 'Anytime'}
		</p>
		<h3 class="text-lg font-semibold text-foreground">{activity.name}</h3>
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
