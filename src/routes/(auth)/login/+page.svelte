<script lang="ts">
	import parisImage from '$lib/assets/images/locations/paris.png';
	import logo from '$lib/assets/logo-transparent.png';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { loginUser } from '$lib/remotes/auth/auth.remote';
</script>

<div class="flex h-screen">
	<!-- Left side - Image -->
	<div class="relative hidden lg:flex lg:w-1/2">
		<div class="relative h-full w-full overflow-hidden">
			<img src={parisImage} alt="Travel destination" class="h-full w-full object-cover" />
			<div class="from-gray/30 absolute inset-0 bg-gradient-to-l to-transparent"></div>
		</div>
	</div>

	<!-- Right side - Form -->
	<div class="flex flex-1 items-center justify-center px-6 py-12">
		<div class="w-full max-w-md space-y-6">
			<!-- Logo -->
			<a href="/" class="flex items-center justify-center gap-1">
				<img src={logo} alt="Embark Logo" class="size-12" />
				<span class="font-serif text-2xl text-primary">Embark</span>
			</a>

			<!-- Header -->
			<div class="space-y-1 text-center">
				<h1 class="font-serif text-3xl text-foreground">Welcome back</h1>
				<p class="text-muted-foreground">Sign in to continue planning</p>
			</div>

			<!-- Form -->
			<form {...loginUser} class="space-y-4">
				<Field.Set>
					<Field.Field>
						<Field.Label for="email">Email</Field.Label>
						<Input
							{...loginUser.fields.email.as('email')}
							autocomplete="off"
							placeholder="brad@example.com"
						/>
						<Field.Error />
					</Field.Field>
					<Field.Field>
						<Field.Label for="password">Password</Field.Label>
						<Input
							{...loginUser.fields.password.as('password')}
							type="password"
							autocomplete="off"
							placeholder="••••••••"
						/>
						<Field.Error />
					</Field.Field>
				</Field.Set>
				<a
					class="text-sm text-primary hover:underline"
					aria-label="Forgot password?"
					href="/forgot-password">Forgot password?</a
				>
				<Button type="submit" class="w-full" size="lg">
					{#if loginUser.pending}
						Logging in...
					{:else}
						Log In
					{/if}
				</Button>
			</form>

			<!-- Footer -->
			<p class="text-center text-sm text-muted-foreground">
				Don't have an account?
				<a href="/register" class="font-medium text-primary hover:underline">Sign up</a>
			</p>
		</div>
	</div>
</div>
