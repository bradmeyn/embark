<script lang="ts">
	import { page } from '$app/state';
	import logo from '$lib/assets/logo-transparent.png';
	import { getCurrentUser } from '$lib/remotes/auth.remote';

	const user = getCurrentUser();

	const navLinkClass =
		'rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200';
</script>

<header class="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-sm">
	<div class="header-enter mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
		<a href="/" class="flex items-center gap-2 rounded-full px-1.5 py-1 transition-colors duration-200 hover:bg-muted/70 sm:gap-2.5 sm:px-2">
			<img src={logo} alt="Embark Logo" class="size-9 sm:size-10" />
			<div>
				<p class="font-serif text-xl leading-none text-primary sm:text-2xl">Embark</p>
				<p class="hidden text-[11px] tracking-[0.16em] text-muted-foreground uppercase sm:block">Trip Planner</p>
			</div>
		</a>

		<nav class="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
			{#if user.current}
				<a
					href="/trips"
					class={`${navLinkClass} ${
						page.url.pathname.startsWith('/trips')
							? 'border-border bg-muted text-foreground shadow-xs'
							: 'border-transparent text-foreground hover:border-border hover:bg-muted'
					} text-xs sm:text-sm`}
				>
					My Trips
				</a>
				<a
					href="/travel-agent"
					class={`${navLinkClass} ${
						page.url.pathname.startsWith('/travel-agent')
							? 'border-primary/70 bg-primary text-primary-foreground shadow-xs'
							: 'border-primary/60 bg-primary text-primary-foreground hover:opacity-90'
					} text-xs sm:text-sm`}
				>
					Travel Agent
				</a>
			{:else if user.ready}
				<a
					href="/login"
					class={`${navLinkClass} ${
						page.url.pathname.startsWith('/login')
							? 'border-border bg-muted text-foreground shadow-xs'
							: 'border-transparent text-foreground hover:border-border hover:bg-muted'
					} text-xs sm:text-sm`}
				>
					Log In
				</a>
				<a
					href="/register"
					class={`${navLinkClass} ${
						page.url.pathname.startsWith('/register')
							? 'border-primary/70 bg-primary text-primary-foreground shadow-xs'
							: 'border-primary/60 bg-primary text-primary-foreground hover:opacity-90'
					} text-xs sm:text-sm`}
				>
					Sign Up
				</a>
			{/if}
		</nav>
	</div>
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
