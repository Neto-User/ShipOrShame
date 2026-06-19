<script lang="ts">
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import type { ProjectDTO } from '$lib/types';

	// Static demo cards so visitors instantly grok the concept.
	const examples: ProjectDTO[] = [
		{
			id: 'demo-1',
			title: 'ai-recipe-generator',
			description: 'Was gonna disrupt cooking. Has a README and nothing else.',
			status: 'IDEA',
			techStack: ['TypeScript', 'openai'],
			liveUrl: null,
			notes: null,
			shameScore: 97,
			isPublic: true,
			hasRepo: true,
			ideaStartedAt: '2024-01-02T00:00:00.000Z',
			repoCreatedAt: '2024-01-02T00:00:00.000Z',
			lastCommitAt: '2024-01-09T00:00:00.000Z'
		},
		{
			id: 'demo-2',
			title: 'side-hustle-tracker',
			description: '"Almost done." Has been almost done for 7 months.',
			status: 'IN_PROGRESS',
			techStack: ['Svelte', 'Postgres'],
			liveUrl: null,
			notes: null,
			shameScore: 58,
			isPublic: true,
			hasRepo: true,
			ideaStartedAt: '2024-10-01T00:00:00.000Z',
			repoCreatedAt: '2024-10-01T00:00:00.000Z',
			lastCommitAt: '2025-02-01T00:00:00.000Z'
		},
		{
			id: 'demo-3',
			title: 'portfolio-v9',
			description: 'You actually shipped this one. A legend walks among us.',
			status: 'SHIPPED',
			techStack: ['Astro'],
			liveUrl: 'https://example.com',
			notes: null,
			shameScore: 0,
			isPublic: true,
			hasRepo: true,
			ideaStartedAt: '2025-03-01T00:00:00.000Z',
			repoCreatedAt: '2025-03-01T00:00:00.000Z',
			lastCommitAt: '2025-05-20T00:00:00.000Z'
		}
	];
</script>

<svelte:head>
	<title>ShipOrShame — Stop lying to yourself about your side projects</title>
	<meta
		name="description"
		content="ShipOrShame connects to your GitHub and publicly displays exactly how long you've been 'almost done' with that app."
	/>
</svelte:head>

<section class="flex flex-col items-center py-16 text-center sm:py-24">
	<span class="mb-4 rounded-full border border-border px-3 py-1 font-display text-xs text-text-muted">
		git commit -m "wip" · 47 times · no follow-up
	</span>
	<h1 class="max-w-3xl font-display text-4xl font-bold leading-tight sm:text-6xl">
		Stop lying to yourself about your
		<span class="text-shame-red">side projects.</span>
	</h1>
	<p class="mt-5 max-w-xl text-lg text-text-muted">
		ShipOrShame connects to your GitHub and publicly displays exactly how long you've been "almost
		done" with that app.
	</p>
	<a href="/login/github" class="btn-primary mt-8 px-6 py-3 text-base">
		Connect GitHub → See Your Shame
	</a>
	<p class="mt-4 font-display text-sm text-text-muted">
		92% of developers abandon side projects within the first month.
		<span class="text-shame-green">Are you the 8%?</span>
	</p>
</section>

<section class="py-8">
	<h2 class="mb-6 text-center font-display text-sm uppercase tracking-widest text-text-muted">
		Real scores. Brutal labels.
	</h2>
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each examples as project (project.id)}
			<ProjectCard {project} readonly />
		{/each}
	</div>
</section>
