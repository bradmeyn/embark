<script lang="ts">
	import TripCard from '$lib/components/trip/trip-card.svelte';
	import CreateTripDialog from '$lib/components/trip/add-trip-dialog.svelte';
	import { getTrips } from '$lib/remotes/trip.remote';
</script>

<div class="container mx-auto max-w-3xl">
	<h1 class="heading-1">Your Trips</h1>

	<svelte:boundary>
		{#snippet pending()}
			<div class="space-y-4 py-6" role="status" aria-live="polite">
				<div class="space-y-4">
					{#each Array(3) as _, i}
						<div class="rounded-lg border-2 p-6 shadow-sm">
							<div class="flex items-center justify-between gap-2">
								<div class="flex-1">
									<div class="flex items-center gap-4">
										<div
											class="mb-3 h-7 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
										></div>
										<div class="flex gap-4">
											<div
												class="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
											></div>
											<div
												class="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
											></div>
										</div>
									</div>
									<div class="mt-2 flex gap-2">
										<div
											class="h-5 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"
										></div>
										<div
											class="h-5 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"
										></div>
									</div>
								</div>
								<div class="flex items-center gap-2">
									<div class="h-9 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
									<div class="h-8 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
									<div class="h-8 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/snippet}

		{#if (await getTrips()).length === 0}
			<div
				class="space-y-4 rounded-lg border border-orange-100 bg-orange-50 p-6 py-10 text-center shadow-sm"
			>
				<h2 class="font-serif text-3xl font-light text-primary">No Trips Yet</h2>
				<p class="text-muted-foreground">
					You haven't created any trips yet. Add your first trip to start planning your adventures.
				</p>
				<CreateTripDialog />
			</div>
		{:else}
			<div class="space-y-4">
				{#each await getTrips() as trip}
					<TripCard {trip} />
				{/each}
			</div>

			<div class="mt-6">
				<CreateTripDialog />
			</div>
		{/if}
	</svelte:boundary>
</div>
