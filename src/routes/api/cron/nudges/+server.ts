import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { runNudgeSweep } from '$lib/server/notifications';

/**
 * Cron endpoint that sends nudge emails. Protect with:
 *   Authorization: Bearer ${CRON_SECRET}
 * Call from Railway/Vercel cron on a daily schedule.
 */
export const POST: RequestHandler = async ({ request }) => {
	const secret = env.CRON_SECRET;
	if (!secret) {
		return json({ message: 'CRON_SECRET not configured.' }, { status: 500 });
	}

	const auth = request.headers.get('authorization');
	if (auth !== `Bearer ${secret}`) {
		return json({ message: 'Unauthorized.' }, { status: 401 });
	}

	try {
		const outcomes = await runNudgeSweep();
		const summary = outcomes.reduce<Record<string, number>>((acc, o) => {
			acc[o.status] = (acc[o.status] ?? 0) + 1;
			return acc;
		}, {});
		return json({ processed: outcomes.length, summary });
	} catch (err) {
		console.error('[cron] nudge sweep failed', err);
		return json({ message: 'Nudge sweep failed.' }, { status: 500 });
	}
};
