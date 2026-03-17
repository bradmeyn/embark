<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import heroImage from '$lib/assets/images/locations/paris.png';
	import logo from '$lib/assets/logo-transparent.png';
</script>

<div class="-m-4 md:-m-8 lg:-m-12">
	<div class="flex min-h-screen">
		<!-- Left side - Image -->
		<div class="relative hidden lg:flex lg:w-1/2">
			<div class="relative h-full w-full overflow-hidden">
				<img src={heroImage} alt="Paris cityscape" class="h-full w-full object-cover" />
				<div class="absolute inset-0 bg-gradient-to-r from-transparent to-background/60"></div>
			</div>
		</div>

		<!-- Right side - Content -->
		<div class="flex flex-1 items-center justify-center px-6 py-12">
			<div class="w-full max-w-md space-y-8">
				<!-- Logo -->
				<a href="/" class="flex items-center justify-center gap-1">
					<img src={logo} alt="Embark Logo" class="size-12" />
					<span class="font-serif text-2xl text-primary">Embark</span>
				</a>

				<!-- Heading -->
				<div class="space-y-3 text-center">
					<h1 class="font-serif text-4xl font-light text-foreground">Where to next?</h1>
					<p class="text-muted-foreground">
						Plan your perfect trip with a beautiful, structured itinerary.
					</p>
				</div>

				<!-- CTAs -->
				<div class="flex flex-col gap-3">
					<Button href="/register" size="lg" class="w-full">Get Started</Button>
					<Button href="/login" size="lg" variant="outline" class="w-full">Sign In</Button>
				</div>
			</div>
		</div>
	</div>
</div>
