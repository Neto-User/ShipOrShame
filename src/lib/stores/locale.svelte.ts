import { browser } from '$app/environment';

type Locale = 'en' | 'pt';

const COOKIE_NAME = 'locale';

function readCookie(): Locale {
	if (!browser) return 'en';
	const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
	return match?.[1] === 'pt' ? 'pt' : 'en';
}

function writeCookie(locale: Locale) {
	if (!browser) return;
	document.cookie = `${COOKIE_NAME}=${locale}; max-age=31536000; path=/`;
}

let currentLocale = $state<Locale>(readCookie());

export const locale = {
	get current() {
		return currentLocale;
	},
	get isPT() {
		return currentLocale === 'pt';
	},
	toggle() {
		currentLocale = currentLocale === 'pt' ? 'en' : 'pt';
		writeCookie(currentLocale);
	}
};
