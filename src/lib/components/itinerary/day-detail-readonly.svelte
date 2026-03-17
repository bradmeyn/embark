<script lang="ts">
	import type { DayWithActivities } from '$db/schemas/itinerary';
	import { Clock3, DollarSign, MapPin, Plane, Building2, ArrowRight, Hash } from '@lucide/svelte';

	let { day }: { day: DayWithActivities } = $props();

	const timeFormatter = new Intl.DateTimeFormat(undefined, {
		hour: 'numeric',
		minute: '2-digit'
	});

	function formatTime(value?: Date | string | null) {
		if (!value) return null;
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return null;
		return timeFormatter.format(date);
	}

	const sortedActivities = $derived(
		[...day.activities].sort((a, b) => {
			const aTime = a.time ? new Date(a.time).getTime() : Number.POSITIVE_INFINITY;
			const bTime = b.time ? new Date(b.time).getTime() : Number.POSITIVE_INFINITY;
			if (aTime === bTime) {
				const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
				const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
				return aCreated - bCreated;
			}
			return aTime - bTime;
		})
	);
</script>

<div class="space-y-6 p-6">
	<!-- Header -->
	<div>
		<div class="flex flex-wrap items-center gap-2">
			<span class="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
				Day {day.dayNumber}
			</span>
			{#if day.date}
				<span class="text-sm text-muted-foreground">
					{new Date(day.date).toLocaleDateString('en-US', {
						weekday: 'short',
						month: 'short',
						day: 'numeric'
					})}
				</span>
			{/if}
		</div>
		<h2 class="mt-1 font-serif text-2xl font-light">{day.location}</h2>
		{#if day.overview}
			<p class="mt-1 text-sm text-muted-foreground">{day.overview}</p>
		{/if}
	</div>

	<!-- Flights -->
	{#if day.flights.length > 0}
		<section class="space-y-3">
			<div class="flex items-center gap-2">
				<Plane class="size-4 text-sky-600" />
				<h3 class="font-serif text-lg">Flights</h3>
			</div>
			<div>
				{#each day.flights as flight}
					<div class="border-b py-3 last:border-0">
						<div>
							<h3 class="text-lg font-semibold text-foreground">
								{flight.airline}
								{#if flight.flightNumber}
									<span class="font-normal text-muted-foreground">({flight.flightNumber})</span>
								{/if}
							</h3>
							<div class="mt-1 flex items-center gap-2 text-sm">
								<span class="font-medium">{flight.departureAirport}</span>
								{#if flight.departureTime}
									<span class="text-muted-foreground">{flight.departureTime}</span>
								{/if}
								<ArrowRight class="size-4 text-muted-foreground" />
								<span class="font-medium">{flight.arrivalAirport}</span>
								{#if flight.arrivalTime}
									<span class="text-muted-foreground">{flight.arrivalTime}</span>
								{/if}
							</div>
							<div class="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
								{#if flight.confirmationNumber}
									<div class="flex items-center gap-1 rounded-full border px-2.5 py-1">
										<Hash class="size-3 text-primary" />
										<span>{flight.confirmationNumber}</span>
									</div>
								{/if}
								{#if flight.cost}
									<div class="flex items-center gap-1 rounded-full border px-2.5 py-1">
										<DollarSign class="size-3 text-primary" />
										<span>{flight.cost}</span>
									</div>
								{/if}
							</div>
							{#if flight.notes}
								<p class="mt-2 text-sm text-muted-foreground">{flight.notes}</p>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Hotels -->
	{#if day.hotels.length > 0}
		<section class="space-y-3">
			<div class="flex items-center gap-2">
				<Building2 class="size-4 text-amber-600" />
				<h3 class="font-serif text-lg">Accommodation</h3>
			</div>
			{#each day.hotels as hotel}
				<div class="border-b py-3 last:border-0">
					<div>
						<h3 class="text-lg font-semibold text-foreground">{hotel.name}</h3>
						<div class="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
							{#if hotel.address}
								<div class="flex items-center gap-1 rounded-full border px-2.5 py-1">
									<MapPin class="size-3 text-primary" />
									<span>{hotel.address}</span>
								</div>
							{/if}
							{#if hotel.confirmationNumber}
								<div class="flex items-center gap-1 rounded-full border px-2.5 py-1">
									<Hash class="size-3 text-primary" />
									<span>{hotel.confirmationNumber}</span>
								</div>
							{/if}
							{#if hotel.cost}
								<div class="flex items-center gap-1 rounded-full border px-2.5 py-1">
									<DollarSign class="size-3 text-primary" />
									<span>{hotel.cost}</span>
								</div>
							{/if}
						</div>
						{#if hotel.notes}
							<p class="mt-2 text-sm text-muted-foreground">{hotel.notes}</p>
						{/if}
					</div>
				</div>
			{/each}
		</section>
	{/if}

	<!-- Activities -->
	<section class="space-y-3">
		<h3 class="font-serif text-lg">Activities</h3>
		{#if sortedActivities.length === 0}
			<div
				class="rounded-lg border border-dashed border-primary/30 bg-primary/5 px-4 py-6 text-center"
			>
				<p class="text-sm font-medium text-primary/60">No activities planned</p>
			</div>
		{:else}
			<ol class="relative">
				{#each sortedActivities as activity}
					<li class="border-b py-3 last:border-0">
						<div>
							<p class="text-sm font-medium text-muted-foreground">
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
										<span>{activity.location}</span>
									</div>
								{/if}
								{#if activity.cost}
									<div class="flex items-center gap-1 rounded-full border px-3 py-1">
										<DollarSign class="size-3 text-primary" />
										<span>{activity.cost}</span>
									</div>
								{/if}
							</div>
						</div>
					</li>
				{/each}
			</ol>
		{/if}
	</section>
</div>
