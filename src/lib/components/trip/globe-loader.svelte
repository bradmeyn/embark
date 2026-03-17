<script lang="ts">
	let { label = 'Generating your itinerary...' }: { label?: string } = $props();
</script>

<div class="flex flex-col items-center justify-center gap-4 py-10">
	<div class="relative size-24">
		<div class="absolute inset-0 animate-spin rounded-full border-2 border-primary/20 border-t-primary"></div>
		<div class="absolute inset-2 animate-[spin_6s_linear_infinite_reverse] rounded-full border border-primary/30"></div>
		<div class="absolute inset-5 rounded-full bg-linear-to-br from-primary/20 to-primary/5"></div>
		<div class="absolute left-1/2 top-1/2 h-0.5 w-14 -translate-x-1/2 -translate-y-1/2 bg-primary/30"></div>
		<div class="absolute left-1/2 top-1/2 h-14 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-primary/30"></div>
	</div>
	<p class="text-sm font-medium text-muted-foreground">{label}</p>
</div>
