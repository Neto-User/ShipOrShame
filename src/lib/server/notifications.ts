import { Resend } from 'resend';
import type { NotificationType, Project, User } from '@prisma/client';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { db } from './db';

const NUDGE_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 7; // 1 nudge per project per 7 days

function appUrl(): string {
	return publicEnv.PUBLIC_APP_URL ?? 'http://localhost:5173';
}

function resendClient(): Resend | null {
	const key = env.RESEND_API_KEY;
	if (!key) return null;
	return new Resend(key);
}

interface NudgeCopy {
	subject: string;
	body: string;
}

/** Friendly-sarcastic copy per nudge type. Never guilt-trips. */
function nudgeCopy(type: NotificationType, project: Project): NudgeCopy {
	const name = project.title;
	const link = `${appUrl()}/dashboard/projects/${project.id}`;
	switch (type) {
		case 'NUDGE':
			return {
				subject: `[ShipOrShame] ${name} is calling you a coward`,
				body: `Remember ${name}? It hasn't seen a commit in two weeks and it's starting to take it personally. Two minutes of love or a guilt-free archive — your call: ${link}`
			};
		case 'MILESTONE':
			return {
				subject: `[ShipOrShame] ${name} is *still* just an idea`,
				body: `It's been a month and ${name} is still pure vapor. Ideas are cheap; a single repo is free. Make it real or let it rest: ${link}`
			};
		case 'SHAME_SPIKE':
			return {
				subject: `[ShipOrShame] ${name} hit critical shame levels 💀`,
				body: `${name}'s shame score just crossed 80. That's "digital graveyard" territory. Resurrect it or bury it with dignity: ${link}`
			};
	}
}

/** Returns true if a nudge of any type was sent for this project in the last 7 days. */
async function recentlyNudged(projectId: string, now: Date): Promise<boolean> {
	const since = new Date(now.getTime() - NUDGE_COOLDOWN_MS);
	const count = await db.notification.count({
		where: { projectId, sentAt: { gte: since } }
	});
	return count > 0;
}

export interface NudgeOutcome {
	projectId: string;
	type: NotificationType;
	status: 'sent' | 'skipped-cooldown' | 'skipped-no-email' | 'error';
}

/**
 * Sends a nudge for a project (respecting the 7-day cooldown) and records it.
 */
export async function sendNudge(
	user: User,
	project: Project,
	type: NotificationType,
	now: Date = new Date()
): Promise<NudgeOutcome> {
	if (await recentlyNudged(project.id, now)) {
		return { projectId: project.id, type, status: 'skipped-cooldown' };
	}
	if (!user.email) {
		return { projectId: project.id, type, status: 'skipped-no-email' };
	}

	const { subject, body } = nudgeCopy(type, project);
	const resend = resendClient();

	try {
		if (resend) {
			await resend.emails.send({
				from: env.RESEND_FROM_EMAIL ?? 'ShipOrShame <onboarding@resend.dev>',
				to: user.email,
				subject,
				text: body
			});
		} else {
			// No API key configured — log instead of failing the cron run.
			console.warn(`[notifications] RESEND_API_KEY not set; would email ${user.email}: ${subject}`);
		}

		await db.notification.create({
			data: { userId: user.id, projectId: project.id, type, message: subject }
		});
		return { projectId: project.id, type, status: 'sent' };
	} catch (err) {
		console.error('[notifications] failed to send nudge', err);
		return { projectId: project.id, type, status: 'error' };
	}
}

/**
 * Scans all users' projects and sends the appropriate nudges.
 * Trigger conditions (see product spec):
 *  - IN_PROGRESS, no commits in 14 days        → NUDGE
 *  - IDEA, no repo, older than 30 days          → MILESTONE
 *  - shameScore crossed 80                      → SHAME_SPIKE
 */
export async function runNudgeSweep(now: Date = new Date()): Promise<NudgeOutcome[]> {
	const day = 1000 * 60 * 60 * 24;
	const users = await db.user.findMany({ include: { projects: true } });
	const outcomes: NudgeOutcome[] = [];

	for (const user of users) {
		for (const project of user.projects) {
			let type: NotificationType | null = null;

			const lastCommitDays = project.lastCommitAt
				? (now.getTime() - project.lastCommitAt.getTime()) / day
				: null;
			const ideaDays = (now.getTime() - project.ideaStartedAt.getTime()) / day;

			if (project.shameScore >= 80 && project.status !== 'SHIPPED') {
				type = 'SHAME_SPIKE';
			} else if (
				project.status === 'IN_PROGRESS' &&
				lastCommitDays !== null &&
				lastCommitDays >= 14
			) {
				type = 'NUDGE';
			} else if (project.status === 'IDEA' && project.githubRepoId === null && ideaDays >= 30) {
				type = 'MILESTONE';
			}

			if (type) {
				outcomes.push(await sendNudge(user, project, type, now));
			}
		}
	}

	return outcomes;
}
