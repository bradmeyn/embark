<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import heroImage from '$lib/assets/images/locations/paris.png';
	import logo from '$lib/assets/logo-transparent.png';
	import { getCurrentUser } from '$lib/remotes/auth.remote';

	const user = getCurrentUser();
</script>

<div class="-m-4 md:-m-8 lg:-m-12">
	<div
		class="relative m-2 min-h-[calc(100vh-1rem)] overflow-hidden rounded-2xl md:m-3 md:min-h-[calc(100vh-1.5rem)]"
	>
		<!-- Hero Image -->
		<div class="absolute inset-0">
			<img src={heroImage} alt="Paris cityscape" class="h-full w-full object-cover" />
			<div
				class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"
			></div>
		</div>

		<!-- Header inside hero -->
		<header class="relative flex items-center justify-between p-4 md:p-6 lg:p-8">
			<a href="/" class="flex items-center gap-1">
				<img src={logo} alt="Embark Logo" class="size-10 md:size-12" />
				<span class="font-serif text-2xl text-primary/80 md:text-3xl">Embark</span>
			</a>
			<nav class="flex items-center gap-4">
				{#if user.current}
					<a href="/trips" class="text-lg text-primary/90 hover:text-primary">My Trips</a>
				{:else if user.ready}
					<a href="/login" class="text-lg text-primary/90 hover:text-primary">Log In</a>
					<Button href="/register" size="sm" class="rounded-full">Sign Up</Button>
				{/if}
			</nav>
		</header>

		<!-- Content -->
		<div
			class="relative flex min-h-[calc(100vh-10rem)] items-center p-6 md:min-h-[calc(100vh-12rem)] md:p-10 lg:p-12"
		>
			<div class="max-w-2xl">
				<h1 class="mb-4 font-serif text-5xl font-light text-white md:text-7xl lg:text-8xl">
					Where to next?
				</h1>
				<p class="mb-8 font-serif text-lg font-light text-white/90 md:text-xl">
					Embark on a journey of a lifetime with our AI-powered travel planner.
				</p>

				<div class="flex items-center gap-4">
					<Button size="lg" href="/register" class="flex items-center gap-2 rounded-full">
						<span>Get Started</span>
						<ArrowRight />
					</Button>
					<Button
						size="lg"
						href="/login"
						variant="outline"
						class="rounded-full border-white/50 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
					>
						Sign In
					</Button>
				</div>
			</div>
		</div>
	</div>
</div>
