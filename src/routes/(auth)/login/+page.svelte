<script lang="ts">
	import logo from '$lib/assets/logo-transparent.png';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { loginUser } from '$lib/remotes/auth.remote';
</script>

<div class="flex min-h-screen">
	<div class="flex flex-1 justify-center">
		<div class="w-full max-w-md space-y-2">
			<div class="flex items-center justify-center">
				<img src={logo} alt="Embark Logo" class="size-20" />
				<p class=" font-serif text-3xl text-primary">Embark</p>
			</div>

			<div class="space-y-2 text-center">
				<h1 class=" text-2xl font-bold">Login</h1>
				<p class="text-muted-foreground">
					Log in to your account to continue planning amazing trips
				</p>
			</div>

			<div class="border-0 bg-transparent shadow-none">
				<form {...loginUser}>
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
					<Button type="submit" class="mt-4 w-full">
						{#if loginUser.pending}
							Logging in...
						{:else}
							Log In
						{/if}
					</Button>
				</form>
			</div>

			<div class="text-center">
				<div class="text-sm text-muted-foreground">
					Don't have an account?{' '}
					<a href="/register" class="font-medium text-primary hover:underline"> Sign up </a>
				</div>
			</div>
		</div>
	</div>
</div>
