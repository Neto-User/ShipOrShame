import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SyncRateLimitError, syncUserRepos } from '$lib/server/github';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ message: 'Not authenticated.' }, { status: 401 });
	}

	try {
		const result = await syncUserRepos(locals.user);
		return json({ synced: result.synced, syncedAt: result.syncedAt.toISOString() });
	} catch (err) {
		if (err instanceof SyncRateLimitError) {
			const mins = Math.ceil(err.retryAfterSeconds / 60);
			return json(
				{ message: `Just synced — try again in ~${mins} min.` },
				{ status: 429, headers: { 'Retry-After': String(err.retryAfterSeconds) } }
			);
		}
		console.error('[sync] failed', err);
		return json({ message: 'Sync failed. Check your GitHub connection.' }, { status: 502 });
	}
};
