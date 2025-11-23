<script lang="ts">
	import logo from '$lib/assets/logo-transparent.png';
	import { getCurrentUser } from '$lib/remotes/auth.remote';

	const user = getCurrentUser();
</script>

<header class="container mx-auto flex items-center justify-between px-4">
	<div class="flex items-center justify-center">
		<img src={logo} alt="Embark Logo" class="size-14" />
		<p class=" font-serif text-xl text-primary">Embark</p>
	</div>
	<nav class="flex items-center space-x-6">
		{#if user.current}
			<a href="/trips" class="py-1 text-primary">My Trips</a>
		{:else if user.ready}
			<a href="/login" class=" py-1 text-primary">Log In</a>
			<a href="/register" class=" py-1 text-primary">Sign Up</a>
		{/if}
	</nav>
</header>
