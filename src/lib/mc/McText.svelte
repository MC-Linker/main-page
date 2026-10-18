<script lang="ts">
    import { mcShadow, parseMc } from './format';

    /** Renders text containing Minecraft formatting codes (`&a`, `§l`, …). */
    let { text, base = '#ffffff' }: { text: string; base?: string } = $props();
    const segments = $derived(parseMc(text, base));
</script>

{#each segments as s, i (i)}<span
        style:color={s.color}
        style:text-shadow="var(--mc-shadow) var(--mc-shadow) 0 {mcShadow(s.color)}"
        style:font-weight={s.bold ? 700 : undefined}
        style:font-style={s.italic ? 'italic' : undefined}
        style:text-decoration={s.underline ? 'underline' : s.strike ? 'line-through' : undefined}
    >{s.text}</span>{/each}
