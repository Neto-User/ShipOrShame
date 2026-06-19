<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import ShameBar from '$lib/components/ShameBar.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import { timeAgo } from '$lib/shame';
	import { PROJECT_STATUSES, STATUS_LABELS } from '$lib/types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const p = $derived(data.project);
	let saving = $state(false);
</script>

<svelte:head><title>Edit {p.title} · ShipOrShame</title></svelte:head>

<div class="mx-auto max-w-2xl">
	<a href="/dashboard" class="text-sm text-text-muted hover:text-text-primary">← Back to dashboard</a>

	<div class="card mt-4 p-6">
		<div class="mb-4 flex items-start justify-between gap-3">
			<div>
				<h1 class="font-display text-2xl font-bold">{p.title}</h1>
				<p class="mt-1 text-sm text-text-muted">
					{#if p.hasRepo}
						Repo created {timeAgo(p.repoCreatedAt)} · last activity {timeAgo(p.lastCommitAt)}
					{:else}
						Idea-only · born {timeAgo(p.ideaStartedAt)}
					{/if}
				</p>
			</div>
			<StatusBadge status={p.status} />
		</div>

		<div class="mb-6">
			<ShameBar score={p.shameScore} />
		</div>

		{#if form?.success}
			<p class="mb-4 rounded-lg border border-shame-green/40 bg-shame-green/10 px-3 py-2 text-sm text-shame-green">
				Saved. Shame recalculated.
			</p>
		{/if}

		<form
			method="POST"
			class="grid gap-4"
			use:enhance={() => {
				saving = true;
				return async ({ update }) => {
					await update();
					saving = false;
				};
			}}
		>
			<div>
				<label class="label" for="title">Title</label>
				<input id="title" name="title" class="input" value={p.title} />
			</div>
			<div>
				<label class="label" for="description">Description</label>
				<textarea id="description" name="description" class="input" rows="2">{p.description ?? ''}</textarea>
			</div>
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label class="label" for="status">Status</label>
					<select id="status" name="status" class="input" value={p.status}>
						{#each PROJECT_STATUSES as s (s)}
							<option value={s}>{STATUS_LABELS[s]}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="label" for="liveUrl">Live URL</label>
					<input id="liveUrl" name="liveUrl" class="input" placeholder="https://..." value={p.liveUrl ?? ''} />
				</div>
			</div>
			<div>
				<label class="label" for="notes">Notes</label>
				<textarea id="notes" name="notes" class="input" rows="3" placeholder="excuses, plans, regrets...">{p.notes ?? ''}</textarea>
			</div>
			<label class="flex items-center gap-2 text-sm text-text-muted">
				<input type="checkbox" name="isPublic" checked={p.isPublic} class="accent-shame-green" />
				Show this project on my public profile
			</label>
			<div>
				<button class="btn-primary" type="submit" disabled={saving}>
					{saving ? 'Saving…' : 'Save changes'}
				</button>
			</div>
		</form>
	</div>
</div>
