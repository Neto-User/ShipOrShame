import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) return { user: null };
	return {
		user: {
			username: locals.user.username,
			name: locals.user.name,
			avatarUrl: locals.user.avatarUrl
		}
	};
};
