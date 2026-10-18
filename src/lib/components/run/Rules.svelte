<script lang="ts">
    // The "category rules" for setting up MC Linker. Every one of them is true.
    const rules = [
        { title: 'No bot to host.', text: 'MC Linker runs on our servers. You just add it to Discord.' },
        { title: 'No config files.', text: 'Everything is set up with slash commands. The plugin works out of the box.' },
        { title: 'No ports to open.', text: 'The plugin connects out to MC Linker, so it works on most hosts, including Aternos.' },
        { title: 'Any server.', text: 'Paper, Spigot, Purpur 1.8+, Fabric and NeoForge up to 26.2, Forge 1.16.5 – 1.20.x, and hybrids.' },
        { title: 'Any player.', text: 'Java, Bedrock (through Geyser and Floodgate) and offline-mode players can link their accounts.' },
        { title: 'Free.', text: 'Every feature. A subscription only if you want MC Linker as your own branded bot.' },
    ];
</script>

<section class="rules" aria-labelledby="rules-title">
    <h2 id="rules-title">Category rules.</h2>
    <ol>
        {#each rules as r, i (r.title)}
            <li>
                <span class="n">{String(i + 1).padStart(2, '0')}</span>
                <div><h3>{r.title}</h3><p>{r.text}</p></div>
            </li>
        {/each}
    </ol>
</section>

<style>
    .rules { max-width: 64rem; margin: 0 auto; padding: clamp(4rem, 9vw, 7rem) clamp(1rem, 4vw, 2rem); }
    h2 { margin: 0 0 2.5rem; text-align: center; font-size: clamp(2.2rem, 5vw, 3.6rem); font-weight: 900; letter-spacing: -0.03em; }
    ol { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr)); gap: 2rem 3rem; margin: 0; padding: 0; list-style: none; }
    li { display: flex; gap: 1rem; padding-top: 1rem; border-top: var(--sticker); }
    .n { flex: none; min-width: 3.1rem; font-family: var(--font-logo); font-size: 2.2rem; line-height: 1; color: var(--color-grass); }
    h3 { margin: 0; font-size: 1.5rem; font-weight: 900; letter-spacing: -0.02em; }
    p { margin: 0.35rem 0 0; line-height: 1.55; color: var(--color-ink-soft); }
</style>
