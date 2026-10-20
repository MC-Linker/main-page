<script lang="ts">
    import BrandIcon from '$lib/components/BrandIcon.svelte';
    import { links } from '$lib/data';
    import OreButton from '$lib/ore/OreButton.svelte';
    import StepCard from './StepCard.svelte';
</script>

<!-- Step 1 happens in Discord. -->
<StepCard step={1} world="discord">
    {#snippet title()}Add MC Linker to your Discord server{/snippet}
    <div class="split">
        <div class="copy">
            <p>Invite the bot to the server you want to link. You need the <em>Manage Server</em> permission there.</p>
            <p class="alt">Or find it in the <a href={links.appDirectory} target="_blank" rel="noopener">App Directory</a> and on <a href={links.socials.topgg} target="_blank" rel="noopener">Top.gg</a>.</p>
        </div>
        <OreButton href={links.invite} external variant="discord" hero size="lg" class="add"><BrandIcon brand="discord" size="1.2em" /> Add to Discord</OreButton>
    </div>
</StepCard>

<style>
    .split { display: flex; align-items: center; gap: 1rem 2rem; }
    .copy { flex: 1; }
    p { margin: 0; color: var(--color-ore-white); line-height: 1.6; }
    em { font-style: normal; font-weight: 600; color: #fff; }
    .alt { margin-top: 0.5rem; font-size: 0.875rem; color: #a3a4a6; }
    a { color: #c9cdfb; }
    .split :global(.add) { flex: none; min-width: 16rem; }
    @media (max-width: 640px) {
        .split { flex-direction: column; align-items: stretch; }
        .split :global(.add) { min-width: 0; }
    }
</style>
