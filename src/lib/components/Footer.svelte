<script lang="ts">
    import { links } from '$lib/data';
    import BrandIcon from './BrandIcon.svelte';

    // Split like the rest of the site: Minecraft links on bedrock, Discord and the rest on dark gray.
    const year = new Date().getFullYear();
</script>

<footer>
    <div class="side mc">
        <a class="brand" href="/"><img src="/banner.png" alt="MC Linker" width="168" height="42" /></a>
        <p class="mc-text tagline">Link your Minecraft server with Discord.</p>
        <nav aria-label="Plugin downloads">
            <h2 class="mc-text">Plugin</h2>
            <ul>
                <li><a href={links.plugin.modrinth}><BrandIcon brand="modrinth" size="1em" /> Modrinth</a></li>
                <li><span class="soon" title="Coming soon"><BrandIcon brand="curseforge" size="1em" /> CurseForge (soon)</span></li>
                <li><a href={links.plugin.hangar}>Hangar</a></li>
                <li><a href={links.plugin.spigot}><BrandIcon brand="spigot" size="1em" /> SpigotMC</a></li>
            </ul>
        </nav>
    </div>
    <div class="side dc">
        <nav aria-label="Community">
            <h2>Community</h2>
            <ul>
                <li><a href={links.support}><BrandIcon brand="discord" size="1em" /> Support server</a></li>
                <li><a href={links.socials.github}><BrandIcon brand="github" size="1em" /> GitHub</a></li>
                <li><a href={links.socials.youtube}><BrandIcon brand="youtube" size="1em" /> YouTube</a></li>
                <li><a href={links.socials.topgg}><BrandIcon brand="topgg" size="1em" /> Top.gg</a></li>
            </ul>
        </nav>
        <nav aria-label="More">
            <h2>More</h2>
            <ul>
                <li><a href={links.guide}>Guide</a></li>
                <li><a href={links.pages.team}>Meet the team</a></li>
                <li><a href={links.pages.terms}>Terms of Service</a></li>
                <li><a href={links.pages.privacy}>Privacy Policy</a></li>
            </ul>
        </nav>
    </div>
    <p class="legal">© {year} MC Linker · Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft. Not affiliated with Discord.</p>
</footer>

<style>
    footer { display: grid; grid-template-columns: 1fr 1fr; background: var(--color-dc-3); }
    .side { display: flex; gap: 2.5rem; padding: 3rem clamp(1rem, 4vw, 3.5rem) 2.5rem; }
    .side.mc {
        flex-direction: column; gap: 1rem; align-items: flex-end; text-align: right;
        background: linear-gradient(rgb(0 0 0 / 0.45), rgb(0 0 0 / 0.45)), var(--tex-bedrock) 0 0 / 64px 64px;
        image-rendering: pixelated;
    }
    .side.dc { flex-wrap: wrap; }
    .brand img { display: block; width: 10.5rem; height: auto; }
    .tagline { margin: 0; color: #e9ecef; }
    h2 { margin: 0 0 0.6rem; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; color: #868e96; font-weight: 700; }
    .mc h2 { font-weight: 400; letter-spacing: 0.04em; color: #ced4da; }
    ul { display: flex; flex-direction: column; gap: 0.4rem; margin: 0; padding: 0; list-style: none; }
    .mc ul { flex-direction: row; flex-wrap: wrap; justify-content: flex-end; gap: 0.4rem 1rem; }
    .soon { display: inline-flex; align-items: center; gap: 0.45rem; color: #868e96; cursor: default; }
    a { display: inline-flex; align-items: center; gap: 0.45rem; color: #ced4da; text-decoration: none; }
    a:hover { color: #fff; text-decoration: underline; }
    .legal { grid-column: 1 / -1; margin: 0; padding: 1.25rem 1rem calc(var(--hud-space) + 0.5rem); border-top: 1px solid rgb(255 255 255 / 0.06); text-align: center; font-size: 0.78rem; color: #6c757d; background: #111214; }
    @media (max-width: 720px) {
        footer { grid-template-columns: 1fr; }
        .side.mc { align-items: flex-start; text-align: left; }
        .mc ul { justify-content: flex-start; }
    }
</style>
