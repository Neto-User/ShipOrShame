import { Octokit } from '@octokit/rest';
import type { Prisma, User } from '@prisma/client';
import { db } from './db';
import { decrypt } from './crypto';
import { computeShameScore } from './shame';

const SYNC_COOLDOWN_MS = 1000 * 60 * 10; // 10 minutes

export class SyncRateLimitError extends Error {
	constructor(public retryAfterSeconds: number) {
		super('Sync rate limited.');
		this.name = 'SyncRateLimitError';
	}
}

/** Builds an authenticated Octokit client from a user's encrypted token. */
function octokitFor(user: User): Octokit {
	if (!user.accessToken) throw new Error('User has no stored access token.');
	return new Octokit({ auth: decrypt(user.accessToken) });
}

interface RepoLike {
	id: number;
	name: string;
	description: string | null;
	created_at: string | null;
	pushed_at: string | null;
	homepage: string | null;
	language: string | null;
	topics?: string[];
}

/** Derives the tech-stack tags from a repo's primary language + topics. */
function techStackFrom(repo: RepoLike): string[] {
	const stack = new Set<string>();
	if (repo.language) stack.add(repo.language);
	for (const topic of repo.topics ?? []) stack.add(topic);
	return [...stack];
}

export interface SyncResult {
	synced: number;
	syncedAt: Date;
}

/**
 * Syncs all of a user's GitHub repositories into the Project table and
 * recomputes shame scores. Respects a 10-minute per-user cooldown.
 *
 * @param force skip the cooldown check (used on first login).
 */
export async function syncUserRepos(user: User, force = false): Promise<SyncResult> {
	const now = new Date();
	if (!force && user.lastSyncAt && now.getTime() - user.lastSyncAt.getTime() < SYNC_COOLDOWN_MS) {
		const retryAfter = Math.ceil(
			(SYNC_COOLDOWN_MS - (now.getTime() - user.lastSyncAt.getTime())) / 1000
		);
		throw new SyncRateLimitError(retryAfter);
	}

	const octokit = octokitFor(user);

	// Paginate through every repo the token can see (includes private if scoped).
	const repos = (await octokit.paginate(octokit.repos.listForAuthenticatedUser, {
		per_page: 100,
		affiliation: 'owner',
		sort: 'pushed'
	})) as RepoLike[];

	let synced = 0;
	for (const repo of repos) {
		const repoCreatedAt = repo.created_at ? new Date(repo.created_at) : null;
		const lastCommitAt = repo.pushed_at ? new Date(repo.pushed_at) : null;
		const techStack = techStackFrom(repo);
		const homepage = repo.homepage?.trim() ? repo.homepage.trim() : null;

		const existing = await db.project.findUnique({
			where: { userId_githubRepoId: { userId: user.id, githubRepoId: BigInt(repo.id) } }
		});

		// Respect user-edited fields: never clobber a manually set status/liveUrl/idea date.
		const status = existing?.statusEditedByUser
			? existing.status
			: (existing?.status ?? 'IN_PROGRESS');
		const liveUrl = existing?.liveUrlEditedByUser ? existing.liveUrl : homepage;
		const ideaStartedAt =
			existing?.ideaStartedByUser && existing
				? existing.ideaStartedAt
				: (repoCreatedAt ?? existing?.ideaStartedAt ?? now);

		const shameScore = computeShameScore(
			{
				status,
				ideaStartedAt,
				githubRepoId: BigInt(repo.id),
				repoCreatedAt,
				lastCommitAt,
				liveUrl
			},
			now
		);

		const data: Prisma.ProjectUncheckedCreateInput = {
			userId: user.id,
			githubRepoId: BigInt(repo.id),
			title: repo.name,
			description: repo.description,
			ideaStartedAt,
			repoCreatedAt,
			lastCommitAt,
			status,
			techStack,
			liveUrl,
			shameScore,
			// preserve existing user-edit flags / notes
			notes: existing?.notes ?? null
		};

		await db.project.upsert({
			where: { userId_githubRepoId: { userId: user.id, githubRepoId: BigInt(repo.id) } },
			create: data,
			update: {
				title: data.title,
				description: data.description,
				repoCreatedAt,
				lastCommitAt,
				ideaStartedAt,
				status,
				techStack,
				liveUrl,
				shameScore
			}
		});
		synced++;
	}

	// Recompute idea-only projects too (their base grows with time).
	await recomputeIdeaProjects(user.id, now);

	await db.user.update({ where: { id: user.id }, data: { lastSyncAt: now } });

	return { synced, syncedAt: now };
}

/** Recomputes shame scores for idea-only (no repo) projects. */
async function recomputeIdeaProjects(userId: string, now: Date): Promise<void> {
	const ideas = await db.project.findMany({ where: { userId, githubRepoId: null } });
	for (const p of ideas) {
		const shameScore = computeShameScore(p, now);
		if (shameScore !== p.shameScore) {
			await db.project.update({ where: { id: p.id }, data: { shameScore } });
		}
	}
}
