<script lang="ts">
    import { type McSegment, mcShadow, parseMc } from './text';

    /**
     * Renders text containing Minecraft formatting codes (`&a`, `§l`, …).
     * Bold is drawn like the game: the glyph again, one pixel to the right.
     */
    let { text, base = '#ffffff' }: { text: string; base?: string } = $props();
    const segments = $derived(parseMc(text, base));

    function style(s: McSegment): string {
        const shadow = `var(--mc-shadow) var(--mc-shadow) 0 ${mcShadow(s.color)}`;
        const rules = [
            `color: ${s.color}`,
            s.bold
                ? `text-shadow: 0.0625em 0 0 ${s.color}, ${shadow}, calc(var(--mc-shadow) + 0.0625em) var(--mc-shadow) 0 ${mcShadow(s.color)}`
                : `text-shadow: ${shadow}`,
        ];
        if(s.bold) rules.push('letter-spacing: 0.0625em');
        if(s.italic) rules.push('font-style: italic');
        if(s.underline) rules.push('text-decoration: underline');
        else if(s.strike) rules.push('text-decoration: line-through');
        return rules.join('; ');
    }
</script>

<!-- On one line: whitespace between the spans would show up in the text. -->
{#each segments as s, i (i)}<span style={style(s)}>{s.text}</span>{/each}
