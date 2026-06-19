/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				bg: '#0a0a0f',
				surface: '#111118',
				border: '#1e1e2e',
				shame: {
					green: '#22c55e',
					yellow: '#eab308',
					red: '#ef4444',
					orange: '#f97316'
				},
				text: {
					primary: '#e2e8f0',
					muted: '#64748b'
				}
			},
			fontFamily: {
				display: ['"Space Mono"', 'ui-monospace', 'monospace'],
				body: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif']
			},
			boxShadow: {
				glow: '0 0 20px rgba(34, 197, 94, 0.35)',
				'glow-red': '0 0 20px rgba(239, 68, 68, 0.35)'
			}
		}
	},
	plugins: []
};
