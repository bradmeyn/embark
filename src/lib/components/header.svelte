<script lang="ts">
	import { page } from '$app/state';
	import logo from '$lib/assets/logo-transparent.png';
	import { getCurrentUser } from '$lib/remotes/auth.remote';
	import { Menu, X } from '@lucide/svelte';

	const user = getCurrentUser();
	let mobileOpen = $state(false);

	const navLinkClass =
		'border-b-2 border-transparent px-2 py-1 text-sm font-medium transition-colors duration-200';

	function closeMobileMenu() {
		mobileOpen = false;
	}
</script>

<header class="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-sm">
	<div
		class="header-enter mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3"
	>
		<a
			href="/"
			class="flex items-center gap-2 rounded-full px-1.5 py-1 transition-colors duration-200 hover:bg-muted/70 sm:gap-2.5 sm:px-2"
		>
			<img src={logo} alt="Embark Logo" class="size-9 sm:size-10" />
			<div>
				<p class="font-serif text-xl leading-none text-primary sm:text-2xl">Embark</p>
				<p class="hidden text-[11px] tracking-[0.16em] text-muted-foreground uppercase sm:block">
					Trip Planner
				</p>
			</div>
		</a>

		<nav class="hidden items-center justify-end gap-1 sm:gap-2 md:flex">
			{#if user.current}
				<a
					href="/trips"
					class={`${navLinkClass} ${
						page.url.pathname.startsWith('/trips')
							? 'border-primary text-primary'
							: 'text-foreground/80 hover:text-primary'
					} text-xs sm:text-sm`}
				>
					My Trips
				</a>
				<a
					href="/travel-agent"
					class={`${navLinkClass} ${
						page.url.pathname.startsWith('/travel-agent')
							? 'border-primary text-primary'
							: 'text-foreground/80 hover:text-primary'
					} text-xs sm:text-sm`}
				>
					Travel Agent
				</a>
			{:else if user.ready}
				<a
					href="/login"
					class={`${navLinkClass} ${
						page.url.pathname.startsWith('/login')
							? 'border-primary text-primary'
							: 'text-foreground/80 hover:text-primary'
					} text-xs sm:text-sm`}
				>
					Log In
				</a>
				<a
					href="/register"
					class={`${navLinkClass} ${
						page.url.pathname.startsWith('/register')
							? 'border-primary text-primary'
							: 'text-foreground/80 hover:text-primary'
					} text-xs sm:text-sm`}
				>
					Sign Up
				</a>
			{/if}
		</nav>

		<button
			type="button"
			class="inline-flex size-9 items-center justify-center rounded-md border border-border text-foreground/80 transition-colors hover:text-primary md:hidden"
			onclick={() => (mobileOpen = !mobileOpen)}
			aria-label="Toggle navigation"
			aria-expanded={mobileOpen}
		>
			{#if mobileOpen}
				<X class="size-4" />
			{:else}
				<Menu class="size-4" />
			{/if}
		</button>
	</div>

	{#if mobileOpen}
		<nav class="mx-auto mb-2 flex w-full max-w-6xl flex-col gap-1 px-3 sm:px-4 md:hidden">
			{#if user.current}
				<a
					href="/trips"
					onclick={closeMobileMenu}
					class="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-primary"
				>
					My Trips
				</a>
				<a
					href="/travel-agent"
					onclick={closeMobileMenu}
					class="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-primary"
				>
					Travel Agent
				</a>
			{:else if user.ready}
				<a
					href="/login"
					onclick={closeMobileMenu}
					class="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-primary"
				>
					Log In
				</a>
				<a
					href="/register"
					onclick={closeMobileMenu}
					class="rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-muted"
				>
					Sign Up
				</a>
			{/if}
		</nav>
	{/if}
</header>

<style>
	.header-enter {
		animation: header-enter 360ms ease-out;
	}

	@keyframes header-enter {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.header-enter {
			animation: none;
		}
	}
</style>
