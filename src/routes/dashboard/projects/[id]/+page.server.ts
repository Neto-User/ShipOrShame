import { error, fail, redirect } from '@sveltejs/kit';
import type { ProjectStatus } from '@prisma/client';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { computeShameScore } from '$lib/server/shame';
import { PROJECT_STATUSES, serializeProject } from '$lib/types';

function isStatus(v: FormDataEntryValue | null): v is ProjectStatus {
	return typeof v === 'string' && (PROJECT_STATUSES as string[]).includes(v);
}

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) redirect(302, '/login/github');
	const project = await db.project.findFirst({
		where: { id: params.id, userId: locals.user.id }
	});
	if (!project) error(404, 'Project not found.');
	return { project: serializeProject(project) };
};

export const actions: Actions = {
	// Update project fields (status / liveUrl / notes / title / description / isPublic).
	default: async ({ request, params, locals }) => {
		if (!locals.user) redirect(302, '/login/github');

		const project = await db.project.findFirst({
			where: { id: params.id, userId: locals.user.id }
		});
		if (!project) error(404, 'Project not found.');

		const form = await request.formData();
		const status = isStatus(form.get('status')) ? (form.get('status') as ProjectStatus) : project.status;
		const title = (form.get('title') as string | null)?.trim() || project.title;
		const description = (form.get('description') as string | null)?.trim() || null;
		const liveUrlRaw = (form.get('liveUrl') as string | null)?.trim();
		const liveUrl = liveUrlRaw ? liveUrlRaw : null;
		const notes = (form.get('notes') as string | null)?.trim() || null;
		const isPublic = form.get('isPublic') === 'on';

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
					title,
					description,
					status,
					liveUrl,
					notes,
					isPublic,
					shameScore,
					statusEditedByUser: status !== project.status ? true : project.statusEditedByUser,
					liveUrlEditedByUser: liveUrl !== project.liveUrl ? true : project.liveUrlEditedByUser
				}
			});
		} catch (err) {
			console.error('[project edit] update failed', err);
			error(500, 'Could not update the project.');
		}

		return { success: true };
	}
};
