<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import { roastTier } from '$lib/shame';

	let { data }: { data: PageData } = $props();
	const tier = $derived(roastTier(data.averageShame));

	let copied = $state(false);
	async function share() {
		const url = `${$page.url.origin}/u/${data.username}`;
		try {
			await navigator.clipboard.writeText(url);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			copied = false;
		}
	}
</script>

<svelte:head>
	<title>@{data.username}'s shame · ShipOrShame</title>
	<meta name="description" content="See @{data.username}'s side-project shame scores on ShipOrShame." />
</svelte:head>

{#if !data.isPublic}
	<div class="card mx-auto max-w-xl p-10 text-center">
		<p class="font-display text-lg">🙈</p>
		<p class="mt-2 font-display text-text-primary">
			This developer is too ashamed to show their projects.
		</p>
	</div>
{:else}
	<div class="mx-auto max-w-4xl">
		<!-- Header -->
		<div class="card flex flex-col items-center gap-4 p-6 text-center">
			{#if data.avatarUrl}
				<img src={data.avatarUrl} alt="" class="h-20 w-20 rounded-full border border-border" />
			{/if}
			<div>
				<h1 class="font-display text-2xl font-bold">{data.name ?? data.username}</h1>
				<a
					href="https://github.com/{data.username}"
					target="_blank"
					rel="noreferrer noopener"
					class="text-sm text-text-muted hover:text-text-primary">@{data.username} on GitHub ↗</a
				>
			</div>

			<div>
				<div class="font-display text-xs uppercase tracking-widest text-text-muted">
					Overall shame score
				</div>
				<div class="font-display text-6xl font-bold" style="color: {tier.color}">
					{data.averageShame}
				</div>
				<div class="mt-1 text-sm text-text-muted">{tier.label}</div>
			</div>

			<button class="btn-ghost" onclick={share}>
				{copied ? '✓ Copied!' : '🔗 Share profile'}
			</button>
		</div>

		<!-- Projects -->
		{#if data.projects.length === 0}
			<div class="card mt-6 p-10 text-center text-text-muted">
				No public projects yet. Suspiciously clean.
			</div>
		{:else}
			<div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.projects as project (project.id)}
					<ProjectCard {project} readonly />
				{/each}
			</div>
		{/if}
	</div>
{/if}
