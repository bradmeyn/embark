<script lang="ts">
	import logo from '$lib/assets/logo-transparent.png';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const loginUrl = `/login?redirect=/invite/accept/${data.inviteToken}`;
	const registerUrl = `/register?redirect=/invite/accept/${data.inviteToken}`;
</script>

<div class="flex min-h-screen items-center justify-center px-6 py-12">
	<div class="w-full max-w-md space-y-8 text-center">
		<a href="/" class="inline-flex items-center justify-center gap-1">
			<img src={logo} alt="Embark Logo" class="size-12" />
			<span class="font-serif text-2xl text-primary">Embark</span>
		</a>

		<div class="rounded-2xl border bg-card p-8 shadow-sm space-y-6">
			<div class="space-y-2">
				<h1 class="font-serif text-2xl text-foreground">You're invited!</h1>
				<p class="text-muted-foreground">
					You've been invited to collaborate on
					<strong class="text-foreground">{data.tripName}</strong>.
				</p>
				{#if data.email}
					<p class="text-sm text-muted-foreground">
						Sign in or create an account with <strong>{data.email}</strong> to accept.
					</p>
				{/if}
			</div>

			<div class="space-y-3">
				<a
					href={loginUrl}
					class="block w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
				>
					Sign in to accept
				</a>
				<a
					href={registerUrl}
					class="block w-full rounded-lg border border-input px-4 py-3 text-sm font-medium hover:bg-muted transition-colors"
				>
					Create an account
				</a>
			</div>
		</div>
	</div>
</div>
