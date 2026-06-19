import type { Project, ProjectStatus, User } from '@prisma/client';

export const PROJECT_STATUSES: ProjectStatus[] = [
	'IDEA',
	'IN_PROGRESS',
	'SHIPPED',
	'ARCHIVED',
	'ABANDONED'
];

export const STATUS_LABELS: Record<ProjectStatus, string> = {
	IDEA: 'Idea',
	IN_PROGRESS: 'In Progress',
	SHIPPED: 'Shipped',
	ARCHIVED: 'Archived',
	ABANDONED: 'Abandoned'
};

/** Client-safe project shape. Dates are ISO strings, no foreign keys leaked. */
export interface ProjectDTO {
	id: string;
	title: string;
	description: string | null;
	status: ProjectStatus;
	techStack: string[];
	liveUrl: string | null;
	notes: string | null;
	shameScore: number;
	isPublic: boolean;
	hasRepo: boolean;
	ideaStartedAt: string;
	repoCreatedAt: string | null;
	lastCommitAt: string | null;
}

export function serializeProject(p: Project): ProjectDTO {
	return {
		id: p.id,
		title: p.title,
		description: p.description,
		status: p.status,
		techStack: p.techStack,
		liveUrl: p.liveUrl,
		notes: p.notes,
		shameScore: p.shameScore,
		isPublic: p.isPublic,
		hasRepo: p.githubRepoId !== null,
		ideaStartedAt: p.ideaStartedAt.toISOString(),
		repoCreatedAt: p.repoCreatedAt?.toISOString() ?? null,
		lastCommitAt: p.lastCommitAt?.toISOString() ?? null
	};
}

/** Client-safe user shape for headers/profiles. */
export interface PublicUserDTO {
	username: string;
	name: string | null;
	avatarUrl: string | null;
	isPublic: boolean;
}

export function serializePublicUser(u: User): PublicUserDTO {
	return {
		username: u.username,
		name: u.name,
		avatarUrl: u.avatarUrl,
		isPublic: u.isPublic
	};
}
