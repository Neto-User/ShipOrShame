<script lang="ts">
	import { roastTier } from '$lib/shame';

	let { score, showLabel = true }: { score: number; showLabel?: boolean } = $props();

	const tier = $derived(roastTier(score));
	const width = $derived(Math.max(2, Math.min(100, score)));
</script>

<div class="w-full">
	<div class="mb-1 flex items-baseline justify-between gap-2">
		<span class="font-display text-2xl font-bold" style="color: {tier.color}">{score}</span>
		{#if showLabel}
			<span class="text-right text-xs text-text-muted">{tier.label}</span>
		{/if}
	</div>
	<div class="h-2 w-full overflow-hidden rounded-full bg-border">
		<div
			class="h-full rounded-full transition-all duration-500"
			style="width: {width}%; background-color: {tier.color}; box-shadow: 0 0 10px {tier.color}66"
		></div>
	</div>
</div>
