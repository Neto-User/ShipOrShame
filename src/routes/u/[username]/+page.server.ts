import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { averageShame } from '$lib/server/shame';
import { serializeProject } from '$lib/types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = await db.user.findUnique({
		where: { username: params.username },
		include: { projects: { where: { isPublic: true }, orderBy: { shameScore: 'desc' } } }
	});

	if (!user) error(404, 'No such developer.');

	const isOwner = locals.user?.id === user.id;

	// Respect the privacy toggle (owner can always see their own profile).
	if (!user.isPublic && !isOwner) {
		return {
			username: user.username,
			name: user.name,
			avatarUrl: user.avatarUrl,
			isPublic: false,
			isOwner,
			averageShame: 0,
			projects: []
		};
	}

	return {
		username: user.username,
		name: user.name,
		avatarUrl: user.avatarUrl,
		isPublic: true,
		isOwner,
		averageShame: averageShame(user.projects),
		projects: user.projects.map(serializeProject)
	};
};
