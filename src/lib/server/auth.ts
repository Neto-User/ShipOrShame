import { createHash, randomBytes } from 'node:crypto';
import { GitHub } from 'arctic';
import type { Cookies } from '@sveltejs/kit';
import type { Session, User } from '@prisma/client';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { db } from './db';

export const SESSION_COOKIE = 'nokoru_session';
export const OAUTH_STATE_COOKIE = 'github_oauth_state';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const SESSION_RENEW_MS = 1000 * 60 * 60 * 24 * 15; // renew when < 15 days left

/** Arctic GitHub OAuth provider. */
export function createGitHubOAuth(): GitHub {
	const clientId = env.GITHUB_CLIENT_ID;
	const clientSecret = env.GITHUB_CLIENT_SECRET;
	if (!clientId || !clientSecret) {
		throw new Error('GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET are not set.');
	}
	const base = publicEnv.PUBLIC_APP_URL ?? 'http://localhost:5173';
	return new GitHub(clientId, clientSecret, `${base}/login/github/callback`);
}

/** Generates a high-entropy session token (the value stored in the cookie). */
export function generateSessionToken(): string {
	return randomBytes(24).toString('base64url');
}

/** Session IDs are the SHA-256 of the token so a DB leak can't be replayed. */
function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

export async function createSession(token: string, userId: string): Promise<Session> {
	const id = hashToken(token);
	const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
	return db.session.create({ data: { id, userId, expiresAt } });
}

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const id = hashToken(token);
	const result = await db.session.findUnique({
		where: { id },
		include: { user: true }
	});
	if (!result) return { session: null, user: null };

	const { user, ...session } = result;

	// Expired → delete and reject.
	if (Date.now() >= session.expiresAt.getTime()) {
		await db.session.delete({ where: { id } }).catch(() => {});
		return { session: null, user: null };
	}

	// Sliding renewal so active users stay logged in.
	if (session.expiresAt.getTime() - Date.now() < SESSION_RENEW_MS) {
		session.expiresAt = new Date(Date.now() + SESSION_TTL_MS);
		await db.session
			.update({ where: { id }, data: { expiresAt: session.expiresAt } })
			.catch(() => {});
	}

	return { session, user };
}

export async function invalidateSession(token: string): Promise<void> {
	const id = hashToken(token);
	await db.session.delete({ where: { id } }).catch(() => {});
}

export function setSessionCookie(cookies: Cookies, token: string, expiresAt: Date): void {
	cookies.set(SESSION_COOKIE, token, {
		path: '/',
		httpOnly: true,
		secure: !dev(),
		sameSite: 'lax',
		expires: expiresAt
	});
}

export function deleteSessionCookie(cookies: Cookies): void {
	cookies.set(SESSION_COOKIE, '', {
		path: '/',
		httpOnly: true,
		secure: !dev(),
		sameSite: 'lax',
		maxAge: 0
	});
}

function dev(): boolean {
	return (publicEnv.PUBLIC_APP_URL ?? '').startsWith('http://localhost');
}
