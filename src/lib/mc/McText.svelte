<script lang="ts">
    import { mcShadow, parseMc } from './format';

    /** Renders text containing Minecraft formatting codes (`&a`, `§l`, …). Bold is drawn like the game: the glyph again, one pixel to the right. */
    let { text, base = '#ffffff' }: { text: string; base?: string } = $props();
    const segments = $derived(parseMc(text, base));
</script>

{#each segments as s, i (i)}<span
        style:color={s.color}
        style:text-shadow={s.bold
            ? `0.0625em 0 0 ${s.color}, var(--mc-shadow) var(--mc-shadow) 0 ${mcShadow(s.color)}, calc(var(--mc-shadow) + 0.0625em) var(--mc-shadow) 0 ${mcShadow(s.color)}`
            : `var(--mc-shadow) var(--mc-shadow) 0 ${mcShadow(s.color)}`}
        style:letter-spacing={s.bold ? '0.0625em' : undefined}
        style:font-style={s.italic ? 'italic' : undefined}
        style:text-decoration={s.underline ? 'underline' : s.strike ? 'line-through' : undefined}
    >{s.text}</span>{/each}
