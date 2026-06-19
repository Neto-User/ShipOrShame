// Client-safe shame helpers: roast labels, tier colors, and date math.
// No server-only imports here so Svelte components can use it freely.

export interface RoastTier {
	/** Roast label including emoji. */
	label: string;
	/** Stable key for the tier. */
	key: 'shipped' | 'good' | 'slow' | 'oof' | 'coma' | 'graveyard' | 'clown';
	/** Hex color from the palette for bars/badges. */
	color: string;
}

const SHIPPED: RoastTier = { label: '🚀 Shipped. Respect.', key: 'shipped', color: '#22c55e' };

/** Maps a 0–100 shame score to its roast tier. */
export function roastTier(score: number): RoastTier {
	if (score <= 0) return SHIPPED;
	if (score <= 20) return { label: '😊 Making moves', key: 'good', color: '#22c55e' };
	if (score <= 40) return { label: '🐢 Taking your time...', key: 'slow', color: '#eab308' };
	if (score <= 60) return { label: '😬 Oof. The vibes are off.', key: 'oof', color: '#f97316' };
	if (score <= 80)
		return { label: '💀 This project is in a coma.', key: 'coma', color: '#f97316' };
	if (score <= 99)
		return { label: '☠️ Digital graveyard. RIP.', key: 'graveyard', color: '#ef4444' };
	return {
		label: '🤡 You should be legally required to apologize.',
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

/** Human "3 days ago" / "today" string for last-activity display. */
export function timeAgo(date: Date | string | null | undefined): string {
	if (!date) return 'never';
	const days = daysSince(date);
	if (days === 0) return 'today';
	if (days === 1) return 'yesterday';
	if (days < 30) return `${days} days ago`;
	if (days < 365) {
		const months = Math.floor(days / 30);
		return `${months} month${months === 1 ? '' : 's'} ago`;
	}
	const years = Math.floor(days / 365);
	return `${years} year${years === 1 ? '' : 's'} ago`;
}
