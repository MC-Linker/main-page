<script lang="ts">
    import { links } from '$lib/data';
    import BrandIcon from './BrandIcon.svelte';
</script>

<footer>
    <div class="inner">
        <div class="brand">
            <img src="/logo.svg" alt="" width="40" height="40" />
            <div><strong>MC Linker</strong><span>Minecraft ⇄ Discord, linked.</span></div>
        </div>
        <nav aria-label="Plugin">
            <h2>Plugin</h2>
            <a href={links.plugin.modrinth}>Modrinth</a>
            <a href={links.plugin.curseforge}>CurseForge</a>
            <a href={links.plugin.hangar}>Hangar</a>
            <a href={links.plugin.spigot}>SpigotMC</a>
        </nav>
        <nav aria-label="Community">
            <h2>Community</h2>
            <a href={links.support}><BrandIcon brand="discord" size="1em" /> Support server</a>
            <a href={links.socials.github}><BrandIcon brand="github" size="1em" /> GitHub</a>
            <a href={links.socials.youtube}><BrandIcon brand="youtube" size="1em" /> YouTube</a>
            <a href={links.socials.topgg}><BrandIcon brand="topgg" size="1em" /> Top.gg</a>
        </nav>
        <nav aria-label="More">
            <h2>More</h2>
            <a href={links.guide}>Guide</a>
            <a href={links.pages.team}>Meet the team</a>
            <a href={links.pages.terms}>Terms of Service</a>
            <a href={links.pages.privacy}>Privacy Policy</a>
        </nav>
    </div>
    <p class="legal">Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft. Not affiliated with Discord.</p>
</footer>

<style>
    footer { background: var(--color-ink); color: var(--color-paper); padding: 3.5rem clamp(1rem, 4vw, 2rem) 2rem; }
    .inner { display: flex; flex-wrap: wrap; gap: 2.5rem 4rem; max-width: 72rem; margin: 0 auto; }
    .brand { display: flex; gap: 0.8rem; align-items: flex-start; margin-right: auto; }
    .brand strong { display: block; font-size: 1.2rem; font-weight: 900; }
    .brand span { color: #bdb6a6; font-size: 0.95rem; }
    nav { display: flex; flex-direction: column; gap: 0.45rem; }
    h2 { margin: 0 0 0.3rem; font-family: var(--font-pixel); font-size: 0.95rem; font-weight: 400; color: var(--color-grass-bright); }
    a { display: inline-flex; align-items: center; gap: 0.45rem; color: #e6e0d2; text-decoration: none; }
    a:hover { color: #fff; text-decoration: underline; }
    .legal { max-width: 72rem; margin: 2.5rem auto 0; padding-top: 1.25rem; border-top: 1px solid #3a372f; font-size: 0.8rem; color: #8a8475; }
</style>
