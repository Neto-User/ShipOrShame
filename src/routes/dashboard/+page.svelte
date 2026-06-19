<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ProjectStatus } from '@prisma/client';
	import type { PageData, ActionData } from './$types';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import ShameBar from '$lib/components/ShameBar.svelte';
	import SyncButton from '$lib/components/SyncButton.svelte';
	import { roastTier } from '$lib/shame';
	import { PROJECT_STATUSES, STATUS_LABELS, type ProjectDTO } from '$lib/types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	type SortKey = 'shame' | 'date' | 'activity';
	let filter = $state<ProjectStatus | 'ALL'>('ALL');
	let sort = $state<SortKey>('shame');
	let expandedId = $state<string | null>(null);
	let showAddForm = $state(false);

	const tier = $derived(roastTier(data.averageShame));
	const addIdeaError = $derived((form?.addIdea as { error?: string } | undefined)?.error ?? null);

	const visible = $derived.by(() => {
		let list = data.projects.filter((p) => filter === 'ALL' || p.status === filter);
		const ts = (s: string | null) => (s ? new Date(s).getTime() : 0);
		const sorters: Record<SortKey, (a: ProjectDTO, b: ProjectDTO) => number> = {
			shame: (a, b) => b.shameScore - a.shameScore,
			date: (a, b) => ts(b.ideaStartedAt) - ts(a.ideaStartedAt),
			activity: (a, b) => ts(b.lastCommitAt) - ts(a.lastCommitAt)
		};
		return [...list].sort(sorters[sort]);
	});

	function toggle(id: string) {
		expandedId = expandedId === id ? null : id;
	}

	const counts = $derived.by(() => {
		const c: Record<string, number> = { ALL: data.projects.length };
		for (const s of PROJECT_STATUSES) c[s] = data.projects.filter((p) => p.status === s).length;
		return c;
	});
</script>

<svelte:head><title>Dashboard · ShipOrShame</title></svelte:head>

<!-- Header -->
<div class="card mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
	<div class="flex items-center gap-4">
		{#if data.profile.avatarUrl}
			<img src={data.profile.avatarUrl} alt="" class="h-14 w-14 rounded-full border border-border" />
		{/if}
		<div>
			<h1 class="font-display text-xl font-bold">@{data.profile.username}</h1>
			<a href="/u/{data.profile.username}" class="text-xs text-shame-green hover:underline"
				>View public profile →</a
			>
		</div>
	</div>

	<div class="flex items-center gap-6">
		<div class="text-right">
			<div class="font-display text-xs uppercase tracking-wider text-text-muted">Avg shame</div>
			<div class="font-display text-3xl font-bold" style="color: {tier.color}">
				{data.averageShame}
			</div>
			<div class="text-[11px] text-text-muted">{tier.label}</div>
		</div>
		<SyncButton lastSyncAt={data.lastSyncAt} />
	</div>
</div>

<!-- Controls -->
<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
	<div class="flex flex-wrap gap-1.5">
		<button
			class="rounded-full border px-3 py-1 font-display text-xs {filter === 'ALL'
				? 'border-shame-green/60 text-shame-green'
				: 'border-border text-text-muted'}"
			onclick={() => (filter = 'ALL')}>All ({counts.ALL})</button
		>
		{#each PROJECT_STATUSES as s (s)}
			<button
				class="rounded-full border px-3 py-1 font-display text-xs {filter === s
					? 'border-shame-green/60 text-shame-green'
					: 'border-border text-text-muted'}"
				onclick={() => (filter = s)}>{STATUS_LABELS[s]} ({counts[s]})</button
			>
		{/each}
	</div>

	<div class="flex items-center gap-2">
		<label class="text-xs text-text-muted" for="sort">Sort</label>
		<select id="sort" class="input w-auto py-1 text-xs" bind:value={sort}>
			<option value="shame">Shame score</option>
			<option value="date">Idea date</option>
			<option value="activity">Last activity</option>
		</select>
		<button class="btn-primary py-1.5" onclick={() => (showAddForm = !showAddForm)}>
			+ Add Idea
		</button>
	</div>
</div>

<!-- Add Idea inline form -->
{#if showAddForm}
	<form
		method="POST"
		action="?/addIdea"
		class="card mb-6 grid gap-3 p-4 sm:grid-cols-3"
		use:enhance={() =>
			async ({ result, update }) => {
				if (result.type === 'success') showAddForm = false;
				await update();
			}}
	>
		<div class="sm:col-span-1">
			<label class="label" for="title">Title</label>
			<input id="title" name="title" class="input" placeholder="the-next-big-thing" required />
		</div>
		<div class="sm:col-span-1">
			<label class="label" for="ideaStartedAt">Idea started</label>
			<input id="ideaStartedAt" name="ideaStartedAt" type="date" class="input" />
		</div>
		<div class="sm:col-span-1">
			<label class="label" for="description">Description</label>
			<input id="description" name="description" class="input" placeholder="what is it, really?" />
		</div>
		{#if addIdeaError}
			<p class="text-xs text-shame-red sm:col-span-3">{addIdeaError}</p>
		{/if}
		<div class="sm:col-span-3">
			<button class="btn-primary" type="submit">Save idea</button>
		</div>
	</form>
{/if}

<!-- Project grid -->
{#if visible.length === 0}
	<div class="card p-10 text-center text-text-muted">
		<p class="font-display">No projects here yet.</p>
		<p class="mt-1 text-sm">Sync with GitHub or add an idea to start accumulating shame.</p>
	</div>
{:else}
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each visible as project (project.id)}
			<ProjectCard
				{project}
				expanded={expandedId === project.id}
				onselect={() => toggle(project.id)}
			>
				<form
					method="POST"
					action="?/updateProject"
					class="grid gap-3"
					use:enhance={() => async ({ update }) => { await update(); }}
				>
					<input type="hidden" name="id" value={project.id} />
					<div>
						<label class="label" for="status-{project.id}">Status</label>
						<select id="status-{project.id}" name="status" class="input" value={project.status}>
							{#each PROJECT_STATUSES as s (s)}
								<option value={s}>{STATUS_LABELS[s]}</option>
							{/each}
						</select>
					</div>
					<div>
						<label class="label" for="liveUrl-{project.id}">Live URL</label>
						<input
							id="liveUrl-{project.id}"
							name="liveUrl"
							class="input"
							placeholder="https://..."
							value={project.liveUrl ?? ''}
						/>
					</div>
					<div>
						<label class="label" for="notes-{project.id}">Notes</label>
						<textarea
							id="notes-{project.id}"
							name="notes"
							class="input"
							rows="2"
							placeholder="excuses go here">{project.notes ?? ''}</textarea
						>
					</div>
					<div class="flex items-center justify-between">
						<button class="btn-primary py-1.5" type="submit">Save</button>
						<a href="/dashboard/projects/{project.id}" class="text-xs text-text-muted hover:text-text-primary"
							>Full editor →</a
						>
					</div>
				</form>
			</ProjectCard>
		{/each}
	</div>
{/if}
