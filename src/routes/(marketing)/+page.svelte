<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
</script>

<div class="container mx-auto">
	<div class="mx-auto my-16 max-w-3xl">
		<h1 class="mb-4 text-center font-serif text-8xl font-light">Where to next?</h1>
		<p class="text-center font-serif text-lg font-light">
			Embark on a journey of a lifetime with our AI-powered travel planner.
		</p>

		<div>
			<div class="mt-8 flex items-center justify-center gap-4">
				<Button size="lg" href="/register" class="flex items-center gap-2 rounded-full">
					<span>Get Started</span>
					<ArrowRight />
				</Button>
			</div>
		</div>
	</div>
</div>
