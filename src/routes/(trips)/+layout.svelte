<script lang="ts">
	import '../../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/header.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex h-svh flex-col">
	<Header />
	<div class="mx-auto w-full max-w-6xl flex-1 overflow-hidden px-4">
		{@render children?.()}
	</div>
</div>
