<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import type { Snippet } from 'svelte';
	import LanguageToggle from '$lib/components/LanguageToggle.svelte';
	import { i18n } from '$lib/i18n.svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<div class="flex min-h-screen flex-col">
	<header class="border-b border-border">
		<nav class="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
			<a href="/" class="font-display text-lg font-bold tracking-tight">
				<span class="text-shame-green">Ship</span><span class="text-text-muted">Or</span><span
					class="text-shame-red">Shame</span
				>
			</a>

			<div class="flex items-center gap-3">
				<LanguageToggle />
				{#if data.user}
					{#if $page.url.pathname !== '/dashboard'}
						<a href="/dashboard" class="text-sm text-text-muted hover:text-text-primary">
							{i18n.t?.nav?.dashboard ?? 'Dashboard'}
						</a>
					{/if}
					<a
						href="/u/{data.user.username}"
						class="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary"
					>
						{#if data.user.avatarUrl}
							<img src={data.user.avatarUrl} alt="" class="h-6 w-6 rounded-full" />
						{/if}
						{data.user.username}
					</a>
					<form method="POST" action="/logout">
						<button class="text-sm text-text-muted hover:text-shame-red">
							{i18n.t?.nav?.logout ?? 'Logout'}
						</button>
					</form>
				{:else}
					<a href="/login/github" class="btn-primary">
						{i18n.t?.nav?.connectGithub ?? 'Connect GitHub'}
					</a>
				{/if}
			</div>
		</nav>
	</header>

	<main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
		{@render children()}
	</main>

	<footer class="border-t border-border">
		<div class="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 text-xs text-text-muted">
			<span>{i18n.t?.nav?.builtWith ?? 'Built with love and shame.'}</span>
			<a
				href="https://github.com"
				target="_blank"
				rel="noreferrer noopener"
				class="hover:text-text-primary"
				>{i18n.t?.nav?.openSource ?? 'Open source · MIT'}</a
			>
		</div>
	</footer>
</div>
