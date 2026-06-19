import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { computeShameScore } from '$lib/server/shame';
import { serializeProject } from '$lib/types';

/**
 * JSON API to create an idea-only project (no repo).
 * The dashboard UI uses the `?/addIdea` form action; this endpoint exists
 * for programmatic/scripted use.
 *
 * Body: { title: string, description?: string, ideaStartedAt?: ISO string }
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) return json({ message: 'Not authenticated.' }, { status: 401 });

	let body: { title?: string; description?: string; ideaStartedAt?: string };
	try {
		body = await request.json();
	} catch {
		return json({ message: 'Invalid JSON body.' }, { status: 400 });
	}

	const title = body.title?.trim();
	if (!title) return json({ message: 'title is required.' }, { status: 400 });

	const ideaStartedAt = body.ideaStartedAt ? new Date(body.ideaStartedAt) : new Date();
	if (Number.isNaN(ideaStartedAt.getTime())) {
		return json({ message: 'ideaStartedAt is not a valid date.' }, { status: 400 });
	}

	const shameScore = computeShameScore({
		status: 'IDEA',
		ideaStartedAt,
		githubRepoId: null,
		lastCommitAt: null,
		liveUrl: null
	});

	try {
		const project = await db.project.create({
			data: {
				userId: locals.user.id,
				title,
				description: body.description?.trim() || null,
				ideaStartedAt,
				status: 'IDEA',
				ideaStartedByUser: true,
				statusEditedByUser: true,
				shameScore
			}
		});
		return json(serializeProject(project), { status: 201 });
	} catch (err) {
		console.error('[api] create project failed', err);
		return json({ message: 'Could not create project.' }, { status: 500 });
	}
};
