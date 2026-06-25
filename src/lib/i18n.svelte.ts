import { locale } from '$lib/stores/locale.svelte';
import pt from '$lib/languages/pt.json';

export const i18n = {
	get t() {
		return locale.isPT ? pt : null;
	}
};
