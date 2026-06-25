<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { i18n } from '$lib/i18n.svelte';
	import { timeAgo } from '$lib/shame';
	import { locale } from '$lib/stores/locale.svelte';

	let { lastSyncAt }: { lastSyncAt: string | null } = $props();

	let syncing = $state(false);
	let message = $state<string | null>(null);

	async function sync() {
		if (syncing) return;
		syncing = true;
		message = null;
		try {
			const res = await fetch('/dashboard/sync', { method: 'GET' });
			const data = await res.json().catch(() => ({}));
			if (res.ok) {
				message = i18n.t?.sync?.synced
					? i18n.t.sync.synced.replace('{count}', String(data.synced ?? 0))
					: `Synced ${data.synced ?? 0} repos.`;
				await invalidateAll();
			} else if (res.status === 429) {
				message = data.message ?? (i18n.t?.sync?.slowDown ?? 'Slow down — try again in a few minutes.');
			} else {
				message = data.message ?? (i18n.t?.sync?.syncFailed ?? 'Sync failed. Try again later.');
			}
		} catch {
			message = i18n.t?.sync?.networkError ?? 'Network error during sync.';
		} finally {
			syncing = false;
		}
	}
</script>

<div class="flex flex-col items-end gap-1">
	<button class="btn-ghost" onclick={sync} disabled={syncing}>
		{#if syncing}
			<span class="inline-block animate-spin">⟳</span> {i18n.t?.sync?.syncing ?? 'Syncing…'}
		{:else}
			⟳ {i18n.t?.sync?.syncWithGithub ?? 'Sync with GitHub'}
		{/if}
	</button>
	<span class="text-xs text-text-muted">
		{#if message}
			{message}
		{:else if lastSyncAt}
			{i18n.t?.sync?.lastSynced?.replace('{time}', timeAgo(lastSyncAt, locale.current)) ?? `Last synced ${timeAgo(lastSyncAt, locale.current)}`}
		{:else}
			{i18n.t?.sync?.neverSynced ?? 'Never synced'}
		{/if}
	</span>
</div>
