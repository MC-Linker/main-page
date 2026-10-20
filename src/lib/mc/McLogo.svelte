<script lang="ts">
    /**
     * Words in the style of the Minecraft logo: the blocky logo font, a stone
     * face, a stepped 3D edge and a dark outline. Size it with font-size.
     */
    let { text, class: className = '' }: { text: string; class?: string } = $props();
</script>

<span class="logo-text {className}">{text}</span>

<style>
    .logo-text {
        display: inline-block;
        font-family: var(--font-logo);
        font-weight: 400;
        line-height: 1;
        white-space: nowrap;
        color: transparent;
        /* Light stone face. */
        background: linear-gradient(rgb(255 255 255 / 0.32), rgb(255 255 255 / 0.32)), var(--tex-stone) 0 0 / 0.5em 0.5em;
        -webkit-background-clip: text;
        background-clip: text;
        image-rendering: pixelated;
        /* A stepped edge going down, then a dark outline around everything. */
        filter:
            drop-shadow(0 0.035em 0 #5e5e5e) drop-shadow(0 0.035em 0 #454545) drop-shadow(0 0.035em 0 #2e2e2e)
            drop-shadow(0.025em 0 0 #111) drop-shadow(-0.025em 0 0 #111) drop-shadow(0 -0.025em 0 #111) drop-shadow(0 0.025em 0 #111)
            drop-shadow(0 0.35rem 0.5rem rgb(0 0 0 / 0.35));
    }
</style>
