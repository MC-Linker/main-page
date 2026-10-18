<script lang="ts">
    import PixelArt from './PixelArt.svelte';
    import { head, looks, type Look, type LookName } from './sprites';

    type Props = { look: LookName | Look; size?: string; title?: string; class?: string };
    let { look, size = '2rem', title, class: className = '' }: Props = $props();

    const sprite = $derived(head(typeof look === 'string' ? looks[look] : look));
</script>

<PixelArt {sprite} width={size} {title} class={className} />
