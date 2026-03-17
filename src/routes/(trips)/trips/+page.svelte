<script lang="ts">
	import TripCard from '$lib/components/trip/trip-card.svelte';
	import CreateTripDialog from '$lib/components/trip/add-trip-dialog.svelte';
	import { getMyTrips, getSharedTrips } from '$lib/remotes/trip.remote';

	const myTripsPromise = getMyTrips();
	const sharedTripsPromise = getSharedTrips();
</script>

<div class="h-full overflow-y-auto">
	<div class="mx-auto w-full max-w-6xl py-6">
		<svelte:boundary>
			{#snippet pending()}
				<div class="space-y-4 py-4" role="status" aria-live="polite">
					<div class="overflow-hidden rounded-2xl border bg-card p-6 shadow-sm">
						<div class="h-7 w-40 animate-pulse rounded bg-muted"></div>
						<div class="mt-3 h-4 w-72 animate-pulse rounded bg-muted"></div>
						<div class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
							{#each Array.from({ length: 3 }, (_, i) => i) as i (i)}
								<div class="h-16 animate-pulse rounded-xl bg-muted"></div>
							{/each}
						</div>
					</div>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{#each Array.from({ length: 3 }, (_, i) => i) as i (i)}
							<div class="h-56 animate-pulse rounded-xl border bg-card"></div>
						{/each}
					</div>
				</div>
			{/snippet}

			{@const myTrips = await myTripsPromise}
			{@const sharedTrips = await sharedTripsPromise}

			<div class="space-y-8 pb-8">
				<section class="fade-up relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm" style="--stagger: 0;">
					<div class="pointer-events-none absolute inset-0 bg-linear-to-r from-primary/10 via-transparent to-primary/5"></div>
					<div class="pointer-events-none absolute -top-24 -right-20 size-56 rounded-full bg-primary/10 blur-3xl"></div>
					<div class="relative">
						<div class="flex flex-wrap items-start justify-between gap-4">
							<div>
								<p class="text-xs tracking-[0.12em] text-muted-foreground uppercase">Trip Dashboard</p>
								<h1 class="mt-2 font-serif text-4xl font-light text-foreground">Your Trips</h1>
								<p class="mt-2 max-w-xl text-sm text-muted-foreground">
									Track what you own, what is shared with you, and jump back into planning in one place.
								</p>
							</div>
							<div>
								<CreateTripDialog />
							</div>
						</div>

						<div class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
							<div class="rounded-xl border bg-background/70 p-3">
								<p class="text-xs tracking-wide text-muted-foreground uppercase">My Trips</p>
								<p class="mt-1 font-serif text-2xl text-primary">{myTrips.length}</p>
							</div>
							<div class="rounded-xl border bg-background/70 p-3">
								<p class="text-xs tracking-wide text-muted-foreground uppercase">Shared With Me</p>
								<p class="mt-1 font-serif text-2xl text-primary">{sharedTrips.length}</p>
							</div>
							<div class="rounded-xl border bg-background/70 p-3">
								<p class="text-xs tracking-wide text-muted-foreground uppercase">Total Visible</p>
								<p class="mt-1 font-serif text-2xl text-primary">{myTrips.length + sharedTrips.length}</p>
							</div>
						</div>
					</div>
				</section>

				<section class="fade-up" style="--stagger: 1;">
					{#if myTrips.length === 0}
						<div class="space-y-4 rounded-2xl border bg-card p-10 text-center shadow-sm">
							<h2 class="font-serif text-3xl font-light text-primary">No Trips Yet</h2>
							<p class="mx-auto max-w-lg text-muted-foreground">
								Start your first itinerary and use AI suggestions to quickly build out days,
								activities, and accommodations.
							</p>
							<div class="mx-auto mt-2">
								<CreateTripDialog />
							</div>
						</div>
					{:else}
						<div class="mb-4 flex items-center justify-between">
							<div>
								<p class="text-xs tracking-wide text-muted-foreground uppercase">Owned</p>
								<h2 class="font-serif text-2xl">Your active itineraries</h2>
							</div>
						</div>
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{#each myTrips as trip, i (trip.id)}
								<div class="fade-up" style={`--stagger: ${i + 2};`}>
									<TripCard {trip} />
								</div>
							{/each}
						</div>
					{/if}
				</section>

				{#if sharedTrips.length > 0}
					<section class="fade-up" style="--stagger: 3;">
						<div class="mb-4">
							<p class="text-xs tracking-wide text-muted-foreground uppercase">Collaboration</p>
							<h2 class="font-serif text-2xl">Shared with me</h2>
						</div>
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{#each sharedTrips as trip, i (trip.id)}
								<div class="fade-up" style={`--stagger: ${i + 4};`}>
									<TripCard {trip} readonly={false} />
								</div>
							{/each}
						</div>
					</section>
				{/if}
			</div>
		</svelte:boundary>
	</div>
</div>

<style>
	.fade-up {
		opacity: 0;
		animation: fade-up 520ms ease-out forwards;
		animation-delay: calc(var(--stagger, 0) * 50ms);
	}

	@keyframes fade-up {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.fade-up {
			opacity: 1;
			animation: none;
		}
	}
</style>
