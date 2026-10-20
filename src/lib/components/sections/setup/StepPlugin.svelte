<script lang="ts">
    import BrandIcon from '$lib/components/BrandIcon.svelte';
    import { platformNotes, platforms } from '$lib/data';
    import OreButton from '$lib/ore/OreButton.svelte';
    import OreMenuRow from '$lib/ore/OreMenuRow.svelte';
    import { radioOff, radioOn } from '$lib/ore/sprites';
    import PixelArt from '$lib/pixel/PixelArt.svelte';
    import StepCard from './StepCard.svelte';

    // Picking the server software, like a list of choices in an Ore UI screen.
    let platform = $state(platforms[0].id);
    const current = $derived(platforms.find(p => p.id === platform)!);
    let list: HTMLElement;

    // The list works like one control: arrow keys move the choice (and focus) up and down.
    function listKeys(e: KeyboardEvent) {
        const step = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
        if(!step) return;
        e.preventDefault();
        const i = (platforms.findIndex(p => p.id === platform) + step + platforms.length) % platforms.length;
        platform = platforms[i].id;
        list.querySelectorAll<HTMLElement>('[role="radio"]')[i]?.focus();
    }
</script>

<!-- Step 2 happens in Minecraft: pick your server software and download the plugin or mod. -->
<StepCard step={2} world="minecraft" id="install">
    {#snippet title()}Install the Discord-Linker plugin{/snippet}
    <div class="split">
        <div>
            <p class="label ore-text" id="software-title">Server software</p>
            <!-- svelte-ignore a11y_interactive_supports_focus -->
            <div class="list" role="radiogroup" aria-labelledby="software-title" bind:this={list} onkeydown={listKeys}>
                {#each platforms as p (p.id)}
                    <OreMenuRow
                        role="radio" tabindex={platform === p.id ? 0 : -1} selected={platform === p.id} chevron={false}
                        title={p.name} subtitle="Minecraft {p.versions} · goes in {p.folder}/"
                        onclick={() => (platform = p.id)}
                    >
                        {#snippet icon()}<PixelArt sprite={p.icon} width="100%" />{/snippet}
                        {#snippet trailing()}<span class="radio" aria-hidden="true"><PixelArt sprite={platform === p.id ? radioOn : radioOff} width="100%" /></span>{/snippet}
                    </OreMenuRow>
                {/each}
            </div>
        </div>

        <div class="downloads">
            <p class="label ore-text">Download for {current.name}</p>
            <div class="buttons">
                {#each current.downloads as d (d.name)}
                    <OreButton
                        href={d.href} external disabled={d.disabled}
                        variant={d.recommended ? 'primary' : 'secondary'} hero={d.recommended} size={d.recommended ? 'lg' : 'md'}
                        badge={d.disabled ? 'Coming soon' : d.recommended ? 'Recommended' : undefined}
                        class={d.recommended ? 'wide' : ''}
                    >
                        {#if d.brand}<BrandIcon brand={d.brand} size="1.1em" />{/if}{d.name}
                    </OreButton>
                {/each}
            </div>
            <p class="drop">Drop the file into your <code class="ore-tag">{current.folder}/</code> folder, then restart the server.</p>
            <ul class="notes">
                {#if current.alsoWorksOn}<li>Also works on {current.alsoWorksOn}.</li>{/if}
                {#each platformNotes as n (n)}<li>{n}</li>{/each}
            </ul>
        </div>
    </div>
</StepCard>

<style>
    .split { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 1.5rem 2rem; }
    .label { margin: 0 0 0.6rem; font-size: 0.95rem; color: var(--color-ore-white); }
    .list { display: flex; flex-direction: column; gap: calc(2 * var(--t)); }
    .radio { display: block; width: calc(13 * var(--t)); }
    .buttons { display: grid; grid-template-columns: repeat(auto-fit, minmax(8.5rem, 1fr)); gap: 1.1rem 0.6rem; margin-top: 1rem; }
    .buttons :global(.wide) { grid-column: 1 / -1; }
    .drop { margin: 1.25rem 0 0; color: var(--color-ore-white); line-height: 1.8; }
    .drop code { font-size: 0.9rem; color: var(--color-mc-yellow); }
    .notes { margin: 0.75rem 0 0; padding-left: 1.1rem; font-size: 0.875rem; line-height: 1.55; color: #c4c5c8; }

    @media (max-width: 860px) {
        .split { grid-template-columns: minmax(0, 1fr); }
    }
</style>
