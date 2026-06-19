import { error, redirect } from '@sveltejs/kit';
import { Octokit } from '@octokit/rest';
import { OAuth2RequestError } from 'arctic';
import type { RequestHandler } from './$types';
import {
	createGitHubOAuth,
	createSession,
	generateSessionToken,
	OAUTH_STATE_COOKIE,
	setSessionCookie
} from '$lib/server/auth';
import { db } from '$lib/server/db';
import { encrypt } from '$lib/server/crypto';
import { syncUserRepos } from '$lib/server/github';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get(OAUTH_STATE_COOKIE);

	if (!code || !state || !storedState || state !== storedState) {
		error(400, 'Invalid OAuth state. Please try logging in again.');
	}
	cookies.delete(OAUTH_STATE_COOKIE, { path: '/' });

	const github = createGitHubOAuth();
	let accessToken: string;
	try {
		const tokens = await github.validateAuthorizationCode(code);
		accessToken = tokens.accessToken();
	} catch (err) {
		if (err instanceof OAuth2RequestError) {
			error(400, 'GitHub rejected the authorization code.');
		}
		throw err;
	}

	// Fetch the GitHub identity + a primary email for notifications.
	const octokit = new Octokit({ auth: accessToken });
	const { data: ghUser } = await octokit.users.getAuthenticated();

	let email = ghUser.email;
	if (!email) {
		try {
			const { data: emails } = await octokit.users.listEmailsForAuthenticatedUser();
			email = emails.find((e) => e.primary && e.verified)?.email ?? emails[0]?.email ?? null;
		} catch {
			email = null;
		}
	}

	const user = await db.user.upsert({
		where: { githubId: BigInt(ghUser.id) },
		create: {
			githubId: BigInt(ghUser.id),
			username: ghUser.login,
			name: ghUser.name,
			avatarUrl: ghUser.avatar_url,
			email,
			accessToken: encrypt(accessToken)
		},
		update: {
			username: ghUser.login,
			name: ghUser.name,
			avatarUrl: ghUser.avatar_url,
			email,
			accessToken: encrypt(accessToken)
		}
	});

	const token = generateSessionToken();
	const session = await createSession(token, user.id);
	setSessionCookie(cookies, token, session.expiresAt);

	// Best-effort initial sync; never block login if GitHub is slow/erroring.
	try {
		await syncUserRepos(user, true);
	} catch (err) {
		console.error('[login] initial sync failed', err);
	}

	redirect(302, '/dashboard');
};
