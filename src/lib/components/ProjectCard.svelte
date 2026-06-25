<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ProjectDTO } from '$lib/types';
	import { i18n } from '$lib/i18n.svelte';
	import { locale } from '$lib/stores/locale.svelte';
	import { timeAgo } from '$lib/shame';
	import StatusBadge from './StatusBadge.svelte';
	import ShameBar from './ShameBar.svelte';

	let {
		project,
		readonly = false,
		expanded = false,
		onselect,
		children
	}: {
		project: ProjectDTO;
		readonly?: boolean;
		expanded?: boolean;
		onselect?: () => void;
		children?: Snippet;
	} = $props();

	const lastActivity = $derived(project.lastCommitAt ?? project.repoCreatedAt);
</script>

<div
	class="card flex flex-col gap-3 p-4 transition {expanded
		? 'ring-1 ring-shame-green/40'
		: ''} {!readonly ? 'cursor-pointer hover:border-shame-green/40' : ''}"
>
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions, a11y_no_noninteractive_tabindex -->
	<div
		class="flex flex-col gap-3"
		onclick={readonly ? undefined : onselect}
		role={readonly ? undefined : 'button'}
		tabindex={readonly ? undefined : 0}
	>
		<div class="flex items-start justify-between gap-2">
			<div class="min-w-0">
				<h3 class="truncate font-display text-base font-bold text-text-primary">{project.title}</h3>
				{#if project.description}
					<p class="mt-0.5 line-clamp-2 text-sm text-text-muted">{project.description}</p>
				{/if}
			</div>
			<StatusBadge status={project.status} />
		</div>

		{#if project.techStack.length}
			<div class="flex flex-wrap gap-1.5">
				{#each project.techStack.slice(0, 6) as tech (tech)}
					<span class="rounded border border-border px-1.5 py-0.5 font-display text-[10px] text-text-muted">
						{tech}
					</span>
				{/each}
			</div>
		{/if}

		<ShameBar score={project.shameScore} />

		<div class="flex items-center justify-between text-xs text-text-muted">
			<span>
				{#if project.hasRepo}
					{i18n.t?.project?.lastActivity ?? 'Last activity'} {timeAgo(lastActivity, locale.current)}
				{:else}
					{i18n.t?.project?.ideaBorn ?? 'Idea born'} {timeAgo(project.ideaStartedAt, locale.current)}
				{/if}
			</span>
			{#if project.liveUrl}
				<a
					href={project.liveUrl}
					target="_blank"
					rel="noreferrer noopener"
					class="text-shame-green hover:underline"
					onclick={(e) => e.stopPropagation()}
					>{i18n.t?.project?.live ?? 'live'} ↗</a
				>
			{/if}
		</div>
	</div>

	{#if expanded && children}
		<div class="border-t border-border pt-3">
			{@render children()}
		</div>
	{/if}
</div>
