import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { averageShame } from '$lib/server/shame';
import { roastTier } from '$lib/shame';

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
	'Cache-Control': 'public, max-age=300'
};

export const OPTIONS: RequestHandler = async () => new Response(null, { headers: CORS_HEADERS });

/** Public shame data for embeds/badges. CORS-open. */
export const GET: RequestHandler = async ({ params }) => {
	const user = await db.user.findUnique({
		where: { username: params.username },
		include: { projects: { where: { isPublic: true } } }
	});

	if (!user || !user.isPublic) {
		return json({ error: 'not_found' }, { status: 404, headers: CORS_HEADERS });
	}

	const score = averageShame(user.projects);
	const tier = roastTier(score);

	return json(
		{
			username: user.username,
			name: user.name,
			avatarUrl: user.avatarUrl,
			shameScore: score,
			label: tier.label,
			tier: tier.key,
			color: tier.color,
			projectCount: user.projects.length,
			shipped: user.projects.filter((p) => p.status === 'SHIPPED').length,
			profileUrl: `/u/${user.username}`
		},
		{ headers: CORS_HEADERS }
	);
};
