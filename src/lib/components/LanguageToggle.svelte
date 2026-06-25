<script lang="ts">
	import { locale } from '$lib/stores/locale.svelte';
</script>

<button
	type="button"
	aria-label="Toggle language"
	onclick={locale.toggle}
	class="inline-flex items-center rounded-full border border-border bg-surface p-1 text-xs font-semibold"
>
	<span
		class={`rounded-full px-2 py-1 transition ${locale.current === 'en' ? 'bg-shame-green text-bg' : 'text-text-muted'}`}
	>
		EN
	</span>
	<span class="px-1 text-text-muted">/</span>
	<span
		class={`rounded-full px-2 py-1 transition ${locale.current === 'pt' ? 'bg-shame-green text-bg' : 'text-text-muted'}`}
	>
		PT
	</span>
</button>
