<script lang="ts">
    import { fade } from 'svelte/transition';
    import { featureItems, rarityColor, tabs, type FeatureItem } from '$lib/data/items';
    import McButton from '$lib/mc/McButton.svelte';
    import McChat from '$lib/mc/McChat.svelte';
    import DcMessage from '$lib/discord/DcMessage.svelte';
    import ItemIcon from '../inventory/ItemIcon.svelte';
    import Slot from '../inventory/Slot.svelte';

    type TabId = (typeof tabs)[number]['id'];
    let tab = $state<TabId>('all');
    let query = $state('');
    let selected = $state<FeatureItem>(featureItems[0]);

    const shown = $derived(featureItems.filter(f => {
        if(tab !== 'all') return f.tab === tab;
        const q = query.trim().toLowerCase();
        if(!q) return true;
        return [f.name, ...f.lore, ...f.commands].join(' ').toLowerCase().includes(q);
    }));
    // Always fill whole rows of nine, like a real inventory.
    const slots = $derived<(FeatureItem | null)[]>([...shown, ...Array(Math.max(0, Math.ceil(Math.max(shown.length, 18) / 9) * 9 - shown.length)).fill(null)]);
    const tabName = $derived(tabs.find(t => t.id === tab)!.name);
</script>

<section id="features" class="features" aria-labelledby="features-title">
    <header class="section-head">
        <p class="kicker mojang">Features</p>
        <h2 id="features-title" class="mc-text">Everything in the inventory</h2>
        <p>Every feature is an item. Pick one to see what it does in Minecraft and in Discord.</p>
    </header>

    <div class="layout">
        <div class="inv">
            <div class="tabs" role="tablist" aria-label="Feature categories">
                {#each tabs as t (t.id)}
                    <button role="tab" type="button" class="tab" aria-selected={tab === t.id} aria-label={t.name} title={t.name} onclick={() => (tab = t.id)}>
                        <ItemIcon icon={t.icon} size="1.5rem" />
                    </button>
                {/each}
            </div>
            <div class="mc-panel panel" role="tabpanel" aria-label={tabName}>
                <div class="panel-head">
                    <p class="mc-panel-title">{tabName}</p>
                    {#if tab === 'all'}
                        <input class="search mc-text" placeholder="Search..." aria-label="Search features" bind:value={query} />
                    {/if}
                </div>
                <div class="grid">
                    {#each slots as item, i (item?.id ?? `empty-${i}`)}
                        <Slot
                            {item}
                            selected={item?.id === selected.id}
                            extra={item ? [...item.commands.map(c => `&e${c}`), '&8Click to preview'] : []}
                            onclick={() => item && (selected = item)}
                        />
                    {/each}
                </div>
                {#if shown.length === 0}<p class="none">Nothing found. Try "chat", "roles" or "/ban".</p>{/if}
            </div>
            <p class="tip mc-text">{tabs.length - 1} tabs · {featureItems.length} items · all free</p>
        </div>

        <!-- The selected item, shown like a big item tooltip. -->
        {#key selected.id}
            <article class="mc-tooltip preview" in:fade={{ duration: 180 }} aria-live="polite">
                <header class="p-head">
                    <ItemIcon icon={selected.icon} glint={selected.glint} size="2.75rem" />
                    <div>
                        <h3 style:color={rarityColor[selected.rarity ?? 'common']}>{selected.name}</h3>
                        <p class="lore">{selected.lore.join(' ')}</p>
                    </div>
                </header>
                {#if selected.commands.length}
                    <ul class="cmds">{#each selected.commands as c (c)}<li>{c}</li>{/each}</ul>
                {/if}
                <div class="worlds">
                    {#if selected.preview.mc}
                        <div class="world">
                            <span class="label mojang">In Minecraft</span>
                            <div class="mc-box"><McChat lines={selected.preview.mc.map((text, id) => ({ id, text: text.replace(/^> /, '&f') }))} /></div>
                        </div>
                    {/if}
                    <div class="world">
                        <span class="label dc-label">In Discord</span>
                        <discord-messages no-background class="dc-box"><DcMessage msg={{ ...selected.preview.dc, id: 1 }} /></discord-messages>
                    </div>
                </div>
                <McButton href={selected.guide}>Read the guide</McButton>
            </article>
        {/key}
    </div>
</section>

<style>
    .features {
        padding: clamp(4rem, 9vw, 7rem) 1rem clamp(4rem, 9vw, 6rem);
        /* The options-screen background: dark dirt. */
        background: linear-gradient(rgb(0 0 0 / 0.7), rgb(0 0 0 / 0.7)), var(--dirt) 0 0 / 64px 64px;
        image-rendering: pixelated;
    }
    .features :global(img), .features :global(svg) { image-rendering: auto; }
    .section-head { margin-bottom: 2.5rem; }

    .layout { display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; gap: 2rem; max-width: 72rem; margin: 0 auto; }
    .inv { --slot: clamp(2.1rem, 8.6vw, 3rem); max-width: 100%; }
    .tabs { display: flex; gap: 2px; padding-left: 6px; }
    .tab {
        position: relative; top: 3px; display: grid; place-items: center; width: 3.25rem; height: 2.75rem; padding: 0; cursor: pointer;
        background: #a0a0a0; border: 3px solid #000; border-bottom: 0; border-radius: 6px 6px 0 0;
        box-shadow: inset 3px 3px 0 #dcdcdc;
    }
    .tab[aria-selected='true'] { z-index: 2; height: 3rem; background: var(--color-mc-ui); box-shadow: inset 3px 3px 0 #fff; }
    .tab:hover { filter: brightness(1.08); }
    .panel { width: max-content; max-width: 100%; }
    .panel-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
    .search { width: 9rem; padding: 0.2rem 0.4rem; border: 2px solid #000; background: #000; color: #fff; font-size: 0.9rem; text-shadow: none; }
    .grid { display: grid; grid-template-columns: repeat(9, var(--slot)); gap: 2px; }
    .none { margin: 0.5rem 0 0; font-size: 0.85rem; color: #3f3f3f; }
    .tip { margin: 0.75rem 0 0; text-align: center; font-size: 0.85rem; color: #aaa; }

    .preview { width: min(31rem, 100%); padding: 1.1rem 1.2rem 1.25rem; font-size: 1rem; }
    .p-head { display: flex; align-items: center; gap: 0.9rem; }
    h3 { margin: 0; font-size: 1.5rem; font-weight: 400; line-height: 1.2; }
    .lore { margin: 0.2rem 0 0; color: #aa00aa; font-style: italic; }
    .cmds { display: flex; flex-wrap: wrap; gap: 0.2rem 0.9rem; margin: 0.75rem 0 0; padding: 0; list-style: none; color: var(--color-mc-yellow); }
    .worlds { display: flex; flex-direction: column; gap: 0.9rem; margin: 1rem 0 1.1rem; text-shadow: none; }
    .label { display: block; margin-bottom: 0.35rem; font-size: 0.8rem; color: #bbb; }
    .dc-label { font-family: var(--font-sans); font-weight: 700; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; }
    .mc-box { padding: 0.75rem; background: linear-gradient(#78a6f7, #b4d3ff); border: 3px solid #000; font-size: 0.9rem; text-shadow: initial; }
    .dc-box { display: block; padding: 0.5rem 1rem; background: var(--color-dc); border-radius: 8px; line-height: 1.375; text-shadow: none; }
</style>
