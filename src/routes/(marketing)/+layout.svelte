<script lang="ts">
	import '../../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/header.svelte';
	import { page } from '$app/state';

	let { children } = $props();

	// Hide header on landing page since it has its own integrated header
	let isLandingPage = $derived(page.url.pathname === '/');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen flex-col">
	{#if !isLandingPage}
		<Header />
	{/if}
	<div class="flex-1 p-4 md:p-8 lg:p-12">
		{@render children?.()}
	</div>
	<footer></footer>
</div>
