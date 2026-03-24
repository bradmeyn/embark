<script lang="ts">
	import { Select as SelectPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import CheckIcon from '@lucide/svelte/icons/check';

	type Option = { value: string; label: string };

	let {
		options,
		placeholder = 'Select...',
		name,
		value = $bindable(''),
		class: className,
		disabled,
		required
	}: {
		options: string[] | Option[];
		placeholder?: string;
		name?: string;
		value?: string;
		class?: string;
		disabled?: boolean;
		required?: boolean;
	} = $props();

	const normalized = $derived(
		options.map((o): Option => (typeof o === 'string' ? { value: o, label: o } : o))
	);

	const selectedLabel = $derived(normalized.find((o) => o.value === value)?.label);
</script>

<SelectPrimitive.Root type="single" bind:value {name} {disabled} {required}>
	<SelectPrimitive.Trigger
		class={cn(
			'border-input bg-background ring-offset-background flex h-9 w-full cursor-pointer items-center justify-between rounded-md border px-3 text-sm outline-none transition-[color,box-shadow]',
			'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
			'disabled:cursor-not-allowed disabled:opacity-50',
			'[&>span]:line-clamp-1',
			className
		)}
	>
		<span class={value ? '' : 'text-muted-foreground'}>{selectedLabel ?? placeholder}</span>
		<ChevronDownIcon class="size-4 shrink-0 opacity-50" />
	</SelectPrimitive.Trigger>
	<SelectPrimitive.Portal>
		<SelectPrimitive.Content
			class="bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] overflow-hidden rounded-md border shadow-md"
			sideOffset={4}
		>
			<SelectPrimitive.Viewport class="p-1">
				{#each normalized as option (option.value)}
					<SelectPrimitive.Item
						value={option.value}
						label={option.label}
						class="focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
					>
						{#snippet children({ selected })}
							<span class="absolute left-2 flex size-3.5 items-center justify-center">
								{#if selected}
									<CheckIcon class="size-4" />
								{/if}
							</span>
							{option.label}
						{/snippet}
					</SelectPrimitive.Item>
				{/each}
			</SelectPrimitive.Viewport>
		</SelectPrimitive.Content>
	</SelectPrimitive.Portal>
</SelectPrimitive.Root>
