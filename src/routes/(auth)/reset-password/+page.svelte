<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import logo from '$lib/assets/logo-transparent.png';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { resetPassword } from '$lib/remotes/auth/auth.remote';

	const token = $derived(page.url.searchParams.get('token') ?? '');

	$effect(() => {
		if (resetPassword.result?.success) {
			goto('/login?reset=success');
		}
	});
</script>

<div class="flex min-h-screen">
	<div class="flex flex-1 justify-center">
		<div class="w-full max-w-md space-y-2">
			<div class="flex items-center justify-center">
				<img src={logo} alt="Embark Logo" class="size-20" />
				<p class="font-serif text-3xl text-primary">Embark</p>
			</div>

			<div class="space-y-2 text-center">
				<h1 class="text-2xl font-bold">Set New Password</h1>
				<p class="text-muted-foreground">Enter your new password</p>
			</div>

			<form {...resetPassword}>
				<input type="hidden" name="token" value={token} />

				<Field.Set>
					<Field.Field>
						<Field.Label for="password">New Password</Field.Label>
						<Input {...resetPassword.fields.password.as('password')} />
						<Field.Error />
					</Field.Field>

					<Field.Field>
						<Field.Label for="confirmPassword">Confirm Password</Field.Label>
						<Input {...resetPassword.fields.confirmPassword.as('password')} />
						<Field.Error />
					</Field.Field>
				</Field.Set>

				<Button type="submit" class="mt-4 w-full">
					{resetPassword.pending ? 'Resetting...' : 'Reset Password'}
				</Button>
			</form>

			<div class="text-center">
				<a href="/login" class="text-sm text-muted-foreground hover:underline">Back to login</a>
			</div>
		</div>
	</div>
</div>
