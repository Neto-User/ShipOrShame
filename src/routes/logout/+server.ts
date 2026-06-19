import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SESSION_COOKIE, deleteSessionCookie, invalidateSession } from '$lib/server/auth';

export const POST: RequestHandler = async ({ cookies }) => {
	const token = cookies.get(SESSION_COOKIE);
	if (token) {
		await invalidateSession(token);
		deleteSessionCookie(cookies);
	}
	redirect(302, '/');
};
