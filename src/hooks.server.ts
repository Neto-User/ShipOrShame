import type { Handle } from '@sveltejs/kit';
import {
	SESSION_COOKIE,
	deleteSessionCookie,
	setSessionCookie,
	validateSessionToken
} from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SESSION_COOKIE);

	if (!token) {
		event.locals.user = null;
		event.locals.sessionId = null;
		return resolve(event);
	}

	const { session, user } = await validateSessionToken(token);

	if (session) {
		// Refresh the cookie expiry to match the (possibly renewed) session.
		setSessionCookie(event.cookies, token, session.expiresAt);
		event.locals.user = user;
		event.locals.sessionId = session.id;
	} else {
		deleteSessionCookie(event.cookies);
		event.locals.user = null;
		event.locals.sessionId = null;
	}

	return resolve(event);
};
