import type { Project, ProjectStatus } from '@prisma/client';
import { daysSince } from '$lib/shame';

export interface ShameInput {
	status: ProjectStatus;
	ideaStartedAt: Date;
	githubRepoId: bigint | null;
	repoCreatedAt?: Date | null;
	lastCommitAt: Date | null;
	liveUrl: string | null;
}

const MAX_BASE_DAYS = 365;

/**
 * Computes the 0–100 shame score for a project. Higher = more shame.
 * See README / product spec for the algorithm.
 */
export function computeShameScore(project: ShameInput, now: Date = new Date()): number {
	// Intentional terminal states carry no shame.
	if (project.status === 'SHIPPED' || project.status === 'ARCHIVED' || project.status === 'ABANDONED') {
		return 0;
	}

	// Base: days since the idea was born, capped at one year.
	const base = Math.min(daysSince(project.ideaStartedAt, now), MAX_BASE_DAYS);

	let multiplier = 1;

	const hasRepo = project.githubRepoId !== null;
	const commitDays = project.lastCommitAt ? daysSince(project.lastCommitAt, now) : null;

	// Pure vaporware: an idea with no repo to back it up.
	if (project.status === 'IDEA' && !hasRepo) multiplier *= 1.5;

	// A repo exists but has never shown a commit timestamp.
	if (commitDays === null && hasRepo) multiplier *= 1.3;

	// Staleness penalties (compounding: stale repos hurt more the longer they sit).
	if (commitDays !== null) {
		if (commitDays > 90) multiplier *= 1.2;
		if (commitDays > 180) multiplier *= 1.4;
	}

	// "In progress" but untouched for a month.
	if (project.status === 'IN_PROGRESS' && commitDays !== null && commitDays >= 30) {
		multiplier *= 1.2;
	}

	// Discount: you actually shipped something live.
	let discount = 1;
	if (project.liveUrl) discount *= 0.1;

	return Math.min(100, Math.floor(base * multiplier * discount));
}

/** Average shame across a set of projects (excludes none — terminal states are 0). */
export function averageShame(projects: Pick<Project, 'shameScore'>[]): number {
	if (projects.length === 0) return 0;
	const total = projects.reduce((sum, p) => sum + p.shameScore, 0);
	return Math.round(total / projects.length);
}
