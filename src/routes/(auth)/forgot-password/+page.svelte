<script lang="ts">
	import logo from '$lib/assets/logo-transparent.png';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { sendPasswordReset } from '$lib/remotes/auth/auth.remote';

	let sent = $derived(sendPasswordReset.result?.success);
</script>

<div class="flex min-h-screen">
	<div class="flex flex-1 justify-center">
		<div class="w-full max-w-md space-y-2">
			<div class="flex items-center justify-center">
				<img src={logo} alt="Embark Logo" class="size-20" />
				<p class="font-serif text-3xl text-primary">Embark</p>
			</div>

			{#if sent}
				<div class="space-y-2 text-center">
					<h1 class="text-2xl font-bold">Check your email</h1>
					<p class="text-muted-foreground">{sendPasswordReset.result?.message}</p>
					<a href="/login" class="text-sm text-primary hover:underline">Back to login</a>
				</div>
			{:else}
				<div class="space-y-2 text-center">
					<h1 class="text-2xl font-bold">Forgot Password</h1>
					<p class="text-muted-foreground">Enter your email to reset your password</p>
				</div>

				<div class="border-0 bg-transparent shadow-none">
					<form {...sendPasswordReset}>
						<Field.Set>
							<Field.Field>
								<Field.Label for="email">Email</Field.Label>
								<Input
									{...sendPasswordReset.fields.email.as('email')}
									autocomplete="off"
									placeholder="brad@example.com"
								/>
								<Field.Error />
							</Field.Field>
						</Field.Set>
						<Button type="submit" class="mt-4 w-full">
							{#if sendPasswordReset.pending}
								Sending reset link...
							{:else}
								Reset Password
							{/if}
						</Button>
					</form>
				</div>

				<div class="text-center">
					<div class="text-sm text-muted-foreground">
						Remember your password?{' '}
						<a href="/login" class="font-medium text-primary hover:underline">Sign in</a>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
