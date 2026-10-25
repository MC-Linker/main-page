<script lang="ts">
    import { headOf, type Look, type LookName } from './heads';
    import PixelArt from './PixelArt.svelte';

    type Props = { look: LookName | Look; size?: string; title?: string; class?: string };
    let { look, size = '2rem', title, class: className = '' }: Props = $props();
</script>

<PixelArt sprite={headOf(look)} width={size} {title} class={className} />
