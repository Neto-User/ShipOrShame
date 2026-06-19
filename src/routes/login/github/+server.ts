import { redirect } from '@sveltejs/kit';
import { generateState } from 'arctic';
import type { RequestHandler } from './$types';
import { createGitHubOAuth, OAUTH_STATE_COOKIE } from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies }) => {
	const github = createGitHubOAuth();
	const state = generateState();

	// `repo` so we can read private repos; `user:email` to capture a notification address.
	const url = github.createAuthorizationURL(state, ['read:user', 'user:email', 'repo']);

	cookies.set(OAUTH_STATE_COOKIE, state, {
		path: '/',
		httpOnly: true,
		secure: !import.meta.env.DEV,
		sameSite: 'lax',
		maxAge: 60 * 10
	});

	redirect(302, url.toString());
};
