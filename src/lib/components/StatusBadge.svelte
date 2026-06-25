<script lang="ts">
	import type { ProjectStatus } from '@prisma/client';
	import { i18n } from '$lib/i18n.svelte';
	import { STATUS_LABELS } from '$lib/types';

	let { status }: { status: ProjectStatus } = $props();

	const styles: Record<ProjectStatus, string> = {
		IDEA: 'border-shame-yellow/40 text-shame-yellow bg-shame-yellow/10',
		IN_PROGRESS: 'border-shame-green/40 text-shame-green bg-shame-green/10',
		SHIPPED: 'border-shame-green/60 text-shame-green bg-shame-green/15',
		ARCHIVED: 'border-text-muted/40 text-text-muted bg-text-muted/10',
		ABANDONED: 'border-shame-red/40 text-shame-red bg-shame-red/10'
	};
</script>

<span
	class="inline-flex items-center rounded-full border px-2.5 py-0.5 font-display text-[11px] font-bold uppercase tracking-wider {styles[
		status
	]}"
>
	{(i18n.t?.dashboard?.statuses?.[status] ?? STATUS_LABELS[status])}
</span>
