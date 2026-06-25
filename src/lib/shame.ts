// Client-safe shame helpers: roast labels, tier colors, and date math.
// No server-only imports here so Svelte components can use it freely.

import { locale } from '$lib/stores/locale.svelte';

export interface RoastTier {
	/** Roast label including emoji. */
	label: string;
	/** Stable key for the tier. */
	key: 'shipped' | 'good' | 'slow' | 'oof' | 'coma' | 'graveyard' | 'clown';
	/** Hex color from the palette for bars/badges. */
	color: string;
}

/** Maps a 0–100 shame score to its roast tier. */
export function roastTier(score: number): RoastTier {
	const isPT = locale.isPT;
	if (score <= 0) {
		return {
			label: isPT ? '🚀 Enviado. Respeito.' : '🚀 Shipped. Respect.',
			key: 'shipped',
			color: '#22c55e'
		};
	}
	if (score <= 20) {
		return {
			label: isPT ? '😊 Fazendo movimentos' : '😊 Making moves',
			key: 'good',
			color: '#22c55e'
		};
	}
	if (score <= 40) {
		return {
			label: isPT ? '🐢 Levando o seu tempo...' : '🐢 Taking your time...',
			key: 'slow',
			color: '#eab308'
		};
	}
	if (score <= 60) {
		return {
			label: isPT ? '😬 Oof. A vibe está estranha.' : '😬 Oof. The vibes are off.',
			key: 'oof',
			color: '#f97316'
		};
	}
	if (score <= 80) {
		return {
			label: isPT ? '💀 Este projeto está em coma.' : '💀 This project is in a coma.',
			key: 'coma',
			color: '#f97316'
		};
	}
	if (score <= 99) {
		return {
			label: isPT ? '☠️ Cemitério digital. RIP.' : '☠️ Digital graveyard. RIP.',
			key: 'graveyard',
			color: '#ef4444'
		};
	}
	return {
		label: isPT
			? '🤡 Você deveria pedir desculpas formalmente.'
			: '🤡 You should be legally required to apologize.',
		key: 'clown',
		color: '#ef4444'
	};
}

/** Whole days between a past date and now (never negative). */
export function daysSince(date: Date | string | null | undefined, now: Date = new Date()): number {
	if (!date) return 0;
	const then = typeof date === 'string' ? new Date(date) : date;
	const ms = now.getTime() - then.getTime();
	return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

/** Human relative date string for last-activity display. */
export function timeAgo(
	date: Date | string | null | undefined,
	localeMode: 'en' | 'pt' = 'en'
): string {
	if (!date) return localeMode === 'pt' ? 'nunca' : 'never';
	const days = daysSince(date);
	const isPT = localeMode === 'pt';
	if (days === 0) return isPT ? 'hoje' : 'today';
	if (days === 1) return isPT ? 'ontem' : 'yesterday';
	if (days < 30) {
		return isPT
			? `${days} dia${days === 1 ? '' : 's'} atrás`
			: `${days} day${days === 1 ? '' : 's'} ago`;
	}
	if (days < 365) {
		const months = Math.floor(days / 30);
		return isPT
			? `${months} mês${months === 1 ? '' : 'es'} atrás`
			: `${months} month${months === 1 ? '' : 's'} ago`;
	}
	const years = Math.floor(days / 365);
	return isPT
		? `${years} ano${years === 1 ? '' : 's'} atrás`
		: `${years} year${years === 1 ? '' : 's'} ago`;
}
