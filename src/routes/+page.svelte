<script lang="ts">
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import { i18n } from '$lib/i18n.svelte';
	import type { ProjectDTO } from '$lib/types';

	// Static demo cards so visitors instantly grok the concept.
	const examples = $derived.by(() => {
		const t = i18n.t;
		return [
			{
				id: 'demo-1',
				title: t?.home?.examples?.oneTitle ?? 'ai-recipe-generator',
				description: t?.home?.examples?.oneDescription ?? 'Was gonna disrupt cooking. Has a README and nothing else.',
				status: 'IDEA' as const,
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
				title: t?.home?.examples?.twoTitle ?? 'side-hustle-tracker',
				description: t?.home?.examples?.twoDescription ?? '"Almost done." Has been almost done for 7 months.',
				status: 'IN_PROGRESS' as const,
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
				title: t?.home?.examples?.threeTitle ?? 'portfolio-v9',
				description: t?.home?.examples?.threeDescription ?? 'You actually shipped this one. A legend walks among us.',
				status: 'SHIPPED' as const,
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
		] as ProjectDTO[];
	});
</script>

<svelte:head>
	<title>Nokoru</title>
	<meta
		name="description"
		content="Nokoru connects to your GitHub and shows the world exactly what you started, what you shipped, and what got left behind."
	/>
</svelte:head>

<section class="flex flex-col items-center py-16 text-center sm:py-24">
	<span class="mb-4 rounded-full border border-border px-3 py-1 font-display text-xs text-text-muted">
		{i18n.t?.home?.tagline ?? 'git commit -m "wip" · 47 times · no follow-up'}
	</span>
	<h1 class="max-w-3xl font-display text-4xl font-bold leading-tight sm:text-6xl">
		{i18n.t?.home?.title ?? 'Every project you never shipped is still waiting.'}
	</h1>
	<p class="mt-5 max-w-xl text-lg text-text-muted">
		{i18n.t?.home?.description ??
			'Nokoru connects to your GitHub and shows the world exactly what you started, what you shipped, and what got left behind.'}
	</p>
	<a href="/login/github" class="btn-primary mt-8 px-6 py-3 text-base">
		{i18n.t?.home?.cta ?? 'Connect GitHub → See What Remains'}
	</a>
	<p class="mt-4 font-display text-sm text-text-muted">
		{i18n.t?.home?.statsLabel ?? '92% of developers abandon side projects within the first month.'}
		<span class="text-shame-green">{i18n.t?.home?.statsHighlight ?? 'Are you the 8%?'}</span>
	</p>
</section>

<section class="py-8">
	<h2 class="mb-6 text-center font-display text-sm uppercase tracking-widest text-text-muted">
		{i18n.t?.home?.sectionTitle ?? 'Real scores. Brutal labels.'}
	</h2>
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each examples as project (project.id)}
			<ProjectCard {project} readonly />
		{/each}
	</div>
</section>
