<script lang="ts">
	import '../../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import logo from '$lib/assets/logo-transparent.png';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-svh flex flex-col bg-muted/40">
	<!-- Minimal header -->
	<header class="border-b bg-background px-4 py-3">
		<div class="container mx-auto max-w-6xl flex items-center justify-between">
			<a href="/" class="flex items-center gap-1">
				<img src={logo} alt="Embark" class="size-8" />
				<span class="font-serif text-lg text-primary">Embark</span>
			</a>
			<div class="flex items-center gap-2">
				<span class="text-sm text-muted-foreground">Want to plan your own trips?</span>
				<a
					href="/register"
					class="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
				>
					Sign up free
				</a>
			</div>
		</div>
	</header>

	<main class="flex-1">
		{@render children?.()}
	</main>
</div>
