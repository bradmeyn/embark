<script lang="ts">
	import sideImage from '$lib/assets/images/locations/nice.png';
	import logo from '$lib/assets/logo-transparent.png';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';

	import { registerUser } from '$lib/remotes/auth.remote';
</script>

<div class="flex h-screen">
	<!-- Left side - Image -->
	<div class="relative hidden lg:flex lg:w-1/2">
		<div class="relative h-full w-full overflow-hidden">
			<img src={sideImage} alt="Travel destination" class="object-fit h-full w-full" />
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
				<h1 class="font-serif text-3xl text-foreground">Create your account</h1>
				<p class="text-muted-foreground">Start planning amazing trips today</p>
			</div>

			{#if registerUser.result?.success === false}
				<div class="rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">
					Registration failed. Please try again.
				</div>
			{/if}

			<!-- Form -->
			<form {...registerUser} class="space-y-4">
				{#each registerUser.fields.issues() as issue}
					<p class="text-sm text-destructive">{issue.message}</p>
				{/each}

				<div class="grid grid-cols-2 gap-3">
					<Field.Field>
						<Field.Label for="firstName">First name</Field.Label>
						<Input
							{...registerUser.fields.firstName.as('text')}
							id="firstName"
							autocomplete="given-name"
							placeholder="John"
						/>
						<Field.Error errors={registerUser.fields.firstName.issues()} />
					</Field.Field>
					<Field.Field>
						<Field.Label for="lastName">Last name</Field.Label>
						<Input
							{...registerUser.fields.lastName.as('text')}
							id="lastName"
							autocomplete="family-name"
							placeholder="Doe"
						/>
						<Field.Error />
					</Field.Field>
				</div>

				<Field.Field>
					<Field.Label for="email">Email</Field.Label>
					<Input
						{...registerUser.fields.email.as('email')}
						id="email"
						type="email"
						autocomplete="email"
						placeholder="john@example.com"
					/>
					<Field.Error />
				</Field.Field>

				<Field.Field>
					<Field.Label for="password">Password</Field.Label>
					<Input
						{...registerUser.fields.password.as('password')}
						id="password"
						type="password"
						autocomplete="new-password"
						placeholder="••••••••"
					/>
					<Field.Error />
				</Field.Field>

				<Field.Field>
					<Field.Label for="confirmPassword">Confirm password</Field.Label>
					<Input
						{...registerUser.fields.confirmPassword.as('password')}
						id="confirmPassword"
						type="password"
						autocomplete="new-password"
						placeholder="••••••••"
					/>
					<Field.Error />
				</Field.Field>

				<Button type="submit" class="w-full" size="lg" disabled={!!registerUser.pending}>
					{#if registerUser.pending}
						Creating account...
					{:else}
						Create Account
					{/if}
				</Button>
			</form>

			<!-- Footer -->
			<p class="text-center text-sm text-muted-foreground">
				Already have an account?
				<a href="/login" class="font-medium text-primary hover:underline">Sign in</a>
			</p>
		</div>
	</div>
</div>
