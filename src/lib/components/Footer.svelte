<script lang="ts">
    import { links } from '$lib/data';
    import BrandIcon from './BrandIcon.svelte';

    const year = new Date().getFullYear();
</script>

<!-- An Ore UI panel along the bottom: the brand, then the links in columns. -->
<footer>
    <div class="inner">
        <div class="brand">
            <a href="/"><img src="/banner.png" alt="MC Linker" width="168" height="42" /></a>
            <p class="tagline">Link your Minecraft server with Discord.</p>
        </div>
        <nav aria-label="Plugin downloads">
            <p class="col-label ore-text">Plugin</p>
            <ul>
                <li><a href={links.plugin.modrinth} target="_blank" rel="noopener"><BrandIcon brand="modrinth" size="1em" /> Modrinth</a></li>
                <li><a href={links.plugin.hangar} target="_blank" rel="noopener"><BrandIcon brand="hangar" size="1em" /> Hangar</a></li>
                <li><a href={links.plugin.spigot} target="_blank" rel="noopener"><BrandIcon brand="spigot" size="1em" /> SpigotMC</a></li>
                <li><a href={links.plugin.curseforge} target="_blank" rel="noopener"><BrandIcon brand="curseforge" size="1em" /> CurseForge</a></li>
            </ul>
        </nav>
        <nav aria-label="Mod downloads">
            <p class="col-label ore-text">Mods</p>
            <ul>
                <li><a href={links.plugin.modrinth} target="_blank" rel="noopener"><BrandIcon brand="modrinth" size="1em" /> Modrinth</a></li>
                <li><a href={links.plugin.curseforgeMods} target="_blank" rel="noopener"><BrandIcon brand="curseforge" size="1em" /> CurseForge</a></li>
            </ul>
        </nav>
        <nav aria-label="Community">
            <p class="col-label ore-text">Community</p>
            <ul>
                <li><a href={links.support} target="_blank" rel="noopener"><BrandIcon brand="discord" size="1em" /> Support server</a></li>
                <li><a href={links.socials.github} target="_blank" rel="noopener"><BrandIcon brand="github" size="1em" /> GitHub</a></li>
                <li><a href={links.donate} target="_blank" rel="noopener"><BrandIcon brand="githubsponsors" size="1em" /> Donate</a></li>
                <li><a href={links.socials.youtube} target="_blank" rel="noopener"><BrandIcon brand="youtube" size="1em" /> YouTube</a></li>
                <li><a href={links.socials.topgg} target="_blank" rel="noopener"><BrandIcon brand="topgg" size="1em" /> Top.gg</a></li>
            </ul>
        </nav>
        <nav aria-label="More">
            <p class="col-label ore-text">More</p>
            <ul>
                <li><a href={links.guide}>Guide</a></li>
                <li><a href={links.pages.team}>Meet the team</a></li>
                <li><a href={links.pages.terms}>Terms of Service</a></li>
                <li><a href={links.pages.privacy}>Privacy Policy</a></li>
            </ul>
        </nav>
    </div>
    <hr class="ore-divider" />
    <p class="legal">© {year} MC Linker · Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft. Not affiliated with Discord.</p>
</footer>

<style>
    footer { border-top: var(--t) solid var(--color-ore-outline); background: var(--color-ore-deep); }
    .inner { display: flex; flex-wrap: wrap; gap: 2.5rem 3rem; max-width: 72rem; margin: 0 auto; padding: 3rem clamp(1rem, 4vw, 2rem) 2.5rem; }
    .brand { flex: 1 1 14rem; }
    .brand img { display: block; width: 10.5rem; height: auto; }
    .tagline { margin: 0.75rem 0 0; color: var(--color-ore-white); }
    .col-label { margin: 0 0 0.75rem; font-size: 0.9rem; font-weight: 400; color: var(--color-mc-gray); }
    ul { display: flex; flex-direction: column; gap: 0.45rem; margin: 0; padding: 0; list-style: none; }
    a { display: inline-flex; align-items: center; gap: 0.45rem; color: var(--color-ore-white); text-decoration: none; }
    a:hover { color: #fff; text-decoration: underline; }
    .legal { margin: 0; padding: 1.25rem 1rem 1.5rem; text-align: center; font-size: 0.78rem; letter-spacing: 0.02em; text-transform: uppercase; color: #8c8d90; }
    @media (max-width: 560px) {
        .inner { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem 1.5rem; }
        .brand { grid-column: 1 / -1; }
    }
</style>
