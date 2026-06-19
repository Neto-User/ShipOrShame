import { error, fail, redirect } from '@sveltejs/kit';
import type { ProjectStatus } from '@prisma/client';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { averageShame, computeShameScore } from '$lib/server/shame';
import { serializeProject, PROJECT_STATUSES } from '$lib/types';

function isStatus(v: FormDataEntryValue | null): v is ProjectStatus {
	return typeof v === 'string' && (PROJECT_STATUSES as string[]).includes(v);
}

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login/github');

	const projects = await db.project.findMany({
		where: { userId: locals.user.id },
		orderBy: { shameScore: 'desc' }
	});

	return {
		projects: projects.map(serializeProject),
		averageShame: averageShame(projects),
		lastSyncAt: locals.user.lastSyncAt?.toISOString() ?? null,
		profile: {
			username: locals.user.username,
			avatarUrl: locals.user.avatarUrl,
			isPublic: locals.user.isPublic
		}
	};
};

export const actions: Actions = {
	// Create a pure idea (no repo).
	addIdea: async ({ request, locals }) => {
		if (!locals.user) redirect(302, '/login/github');
		const form = await request.formData();
		const title = (form.get('title') as string | null)?.trim();
		const description = (form.get('description') as string | null)?.trim() || null;
		const ideaStartedRaw = form.get('ideaStartedAt') as string | null;

		if (!title) return fail(400, { addIdea: { error: 'Title is required.' } });

		const ideaStartedAt = ideaStartedRaw ? new Date(ideaStartedRaw) : new Date();
		if (Number.isNaN(ideaStartedAt.getTime())) {
			return fail(400, { addIdea: { error: 'Invalid start date.' } });
		}

		const shameScore = computeShameScore({
			status: 'IDEA',
			ideaStartedAt,
			githubRepoId: null,
			lastCommitAt: null,
			liveUrl: null
		});

		try {
			await db.project.create({
				data: {
					userId: locals.user.id,
					title,
					description,
					ideaStartedAt,
					status: 'IDEA',
					ideaStartedByUser: true,
					statusEditedByUser: true,
					shameScore
				}
			});
		} catch (err) {
			console.error('[dashboard] addIdea failed', err);
			error(500, 'Could not save your idea.');
		}

		return { addIdea: { success: true } };
	},

	// Inline edit: status / liveUrl / notes.
	updateProject: async ({ request, locals }) => {
		if (!locals.user) redirect(302, '/login/github');
		const form = await request.formData();
		const id = form.get('id') as string | null;
		if (!id) return fail(400, { update: { error: 'Missing project id.' } });

		const project = await db.project.findFirst({ where: { id, userId: locals.user.id } });
		if (!project) return fail(404, { update: { error: 'Project not found.' } });

		const statusRaw = form.get('status');
		const status = isStatus(statusRaw) ? statusRaw : project.status;
		const liveUrlRaw = (form.get('liveUrl') as string | null)?.trim();
		const liveUrl = liveUrlRaw ? liveUrlRaw : null;
		const notes = (form.get('notes') as string | null)?.trim() || null;

		const shameScore = computeShameScore({
			status,
			ideaStartedAt: project.ideaStartedAt,
			githubRepoId: project.githubRepoId,
			repoCreatedAt: project.repoCreatedAt,
			lastCommitAt: project.lastCommitAt,
			liveUrl
		});

		try {
			await db.project.update({
				where: { id: project.id },
				data: {
					status,
					liveUrl,
					notes,
					shameScore,
					statusEditedByUser: status !== project.status ? true : project.statusEditedByUser,
					liveUrlEditedByUser: liveUrl !== project.liveUrl ? true : project.liveUrlEditedByUser
				}
			});
		} catch (err) {
			console.error('[dashboard] updateProject failed', err);
			error(500, 'Could not update the project.');
		}

		return { update: { success: true } };
	}
};
