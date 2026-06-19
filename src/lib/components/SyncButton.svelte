<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { timeAgo } from '$lib/shame';

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
				message = `Synced ${data.synced ?? 0} repos.`;
				await invalidateAll();
			} else if (res.status === 429) {
				message = data.message ?? 'Slow down — try again in a few minutes.';
			} else {
				message = data.message ?? 'Sync failed. Try again later.';
			}
		} catch {
			message = 'Network error during sync.';
		} finally {
			syncing = false;
		}
	}
</script>

<div class="flex flex-col items-end gap-1">
	<button class="btn-ghost" onclick={sync} disabled={syncing}>
		{#if syncing}
			<span class="inline-block animate-spin">⟳</span> Syncing…
		{:else}
			⟳ Sync with GitHub
		{/if}
	</button>
	<span class="text-xs text-text-muted">
		{#if message}
			{message}
		{:else if lastSyncAt}
			Last synced {timeAgo(lastSyncAt)}
		{:else}
			Never synced
		{/if}
	</span>
</div>
