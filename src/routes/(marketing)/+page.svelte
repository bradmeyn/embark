<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { getCurrentUser } from '$lib/remotes/auth.remote';
	import heroImage from '$lib/assets/images/locations/paris.png';
	import { Sparkles, Users, CalendarCheck, MapPinned } from '@lucide/svelte';

	const user = getCurrentUser();
</script>

<div class="relative isolate min-h-screen bg-background">
	<div class="relative mx-auto w-full max-w-6xl px-4 pt-2 pb-6 md:px-8 md:pt-2 md:pb-10">
		<section class="mt-4">
			<div class="fade-up grid overflow-hidden lg:grid-cols-[0.92fr_1.08fr]" style="--stagger: 0;">
				<div class="p-6 md:p-10">
					<h1 class="mt-3 font-serif text-4xl leading-tight font-light text-foreground md:text-6xl">
						Plan your next
						<span class="text-primary">adventure.</span>
					</h1>
					<p class="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
						Embark turns loose travel ideas into beautiful, day-by-day itineraries with AI
						suggestions, map context, and collaborative trip sharing.
					</p>

					<div class="mt-6 flex flex-wrap gap-3 rounded-3xl">
						<Button href={user.current ? '/trips' : '/register'} size="lg">Start Planning</Button>
						<Button href="/travel-agent" size="lg" variant="outline">
							<Sparkles class="size-4" />
							Try Travel Agent
						</Button>
					</div>
				</div>

				<div
					class="relative min-h-104 overflow-hidden rounded-3xl border border-border/70 lg:min-h-136"
				>
					<img src={heroImage} alt="Painted Paris cityscape" class="h-full w-full object-cover" />
					<div class="absolute inset-0"></div>
				</div>
			</div>
		</section>

		<section class="mt-10 grid gap-4 md:grid-cols-3">
			<article class="fade-up rounded-2xl border bg-card p-5 shadow-sm" style="--stagger: 1;">
				<div class="mb-3 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
					<Sparkles class="size-4" />
				</div>
				<h2 class="font-serif text-2xl">Travel Agent</h2>
				<p class="mt-2 text-sm text-muted-foreground">
					Describe your destination, pace, and budget to generate a complete day-by-day itinerary
					draft.
				</p>
			</article>

			<article class="fade-up rounded-2xl border bg-card p-5 shadow-sm" style="--stagger: 2;">
				<div class="mb-3 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
					<Users class="size-4" />
				</div>
				<h2 class="font-serif text-2xl">Trip Sharing</h2>
				<p class="mt-2 text-sm text-muted-foreground">
					Invite collaborators to view and update plans together so everyone stays aligned.
				</p>
			</article>

			<article class="fade-up rounded-2xl border bg-card p-5 shadow-sm" style="--stagger: 3;">
				<div class="mb-3 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
					<CalendarCheck class="size-4" />
				</div>
				<h2 class="font-serif text-2xl">Trip Planning</h2>
				<p class="mt-2 text-sm text-muted-foreground">
					Manage days, hotels, and activities with map-aware context and quick edits from one
					dashboard.
				</p>
			</article>
		</section>

		<section class="mt-6 rounded-2xl border bg-card p-5 shadow-sm md:p-6">
			<div class="fade-up flex flex-wrap items-center justify-between gap-4" style="--stagger: 4;">
				<div>
					<div class="mb-2 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
						<MapPinned class="size-4" />
					</div>
					<h3 class="font-serif text-2xl">Built for practical planning</h3>
					<p class="mt-1 text-sm text-muted-foreground">
						From quick inspiration to structured itinerary management without losing the visual
						feel.
					</p>
				</div>
				<Button href={user.current ? '/trips' : '/register'} size="lg"
					>Start Building Your Trip</Button
				>
			</div>
		</section>
	</div>
</div>

<style>
	.fade-up {
		opacity: 0;
		animation: fade-up 560ms ease-out forwards;
		animation-delay: calc(var(--stagger, 0) * 70ms);
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
			animation: none;
			opacity: 1;
		}
	}
</style>
