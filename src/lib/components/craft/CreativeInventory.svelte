<script lang="ts">
    import { fade } from 'svelte/transition';
    import { featureItems, rarityColor, tabs, type FeatureItem } from '$lib/craft/items';
    import McButton from '$lib/mc/McButton.svelte';
    import McChat from '$lib/mc/McChat.svelte';
    import DcMessage from '$lib/discord/DcMessage.svelte';
    import ItemIcon from './ItemIcon.svelte';
    import Slot from './Slot.svelte';

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
    <header class="head">
        <h2 id="features-title" class="mc-text">Everything in the inventory</h2>
        <p>Every feature is an item. Hover for the details, click one to see what it does in Discord and in Minecraft.</p>
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
                        <input class="search mc-text" placeholder="Search…" aria-label="Search features" bind:value={query} />
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
        </div>

        {#key selected.id}
            <article class="preview" in:fade={{ duration: 180 }} aria-live="polite">
                <header class="p-head">
                    <ItemIcon icon={selected.icon} glint={selected.glint} size="2.5rem" />
                    <div>
                        <h3 class="mc-text" style:color={rarityColor[selected.rarity ?? 'common']}>{selected.name}</h3>
                        <p class="lore mc-text">{selected.lore.join(' ')}</p>
                    </div>
                </header>
                {#if selected.commands.length}
                    <ul class="cmds">{#each selected.commands as c (c)}<li><code>{c}</code></li>{/each}</ul>
                {/if}
                <div class="sides">
                    <div class="dc">
                        <span class="label">In Discord</span>
                        <div class="dc-box"><DcMessage compact msg={{ ...selected.preview.dc, id: 1 }} /></div>
                    </div>
                    {#if selected.preview.mc}
                        <div class="mc">
                            <span class="label mojang">In Minecraft</span>
                            <div class="mc-box"><McChat lines={selected.preview.mc.map((text, id) => ({ id, text: text.replace(/^> /, '&f') }))} /></div>
                        </div>
                    {/if}
                </div>
                <McButton href={selected.guide}>Read the guide</McButton>
            </article>
        {/key}
    </div>
</section>

<style>
    .features { padding: clamp(4rem, 9vw, 7rem) 1rem; }
    .head { text-align: center; margin-bottom: 2.5rem; }
    h2 { margin: 0; font-size: clamp(2rem, 5vw, 3.25rem); color: #fff; }
    .head p { margin: 0.75rem auto 0; max-width: 34rem; color: #ccc; }

    .layout { display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; gap: 2rem; max-width: 70rem; margin: 0 auto; }
    .inv { --slot: clamp(2.15rem, 8.6vw, 2.75rem); max-width: 100%; }
    .tabs { display: flex; gap: 2px; padding-left: 6px; }
    .tab {
        position: relative; top: 3px; display: grid; place-items: center; width: 3rem; height: 2.6rem; padding: 0; cursor: pointer;
        background: #a0a0a0; border: 3px solid #000; border-bottom: 0; border-radius: 6px 6px 0 0;
        box-shadow: inset 3px 3px 0 #dcdcdc;
    }
    .tab[aria-selected='true'] { z-index: 2; height: 2.85rem; top: 3px; background: var(--color-mc-ui); box-shadow: inset 3px 3px 0 #fff; }
    .tab:hover { filter: brightness(1.08); }
    .panel { width: max-content; max-width: 100%; }
    .panel-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
    .search { width: 9rem; padding: 0.2rem 0.4rem; border: 2px solid #000; background: #000; color: #fff; font-size: 0.9rem; text-shadow: none; }
    .grid { display: grid; grid-template-columns: repeat(9, var(--slot)); gap: 2px; }
    .none { margin: 0.5rem 0 0; font-size: 0.85rem; color: #3f3f3f; }

    .preview { width: min(30rem, 100%); padding: 1.25rem; background: rgb(0 0 0 / 0.45); border: 2px solid rgb(255 255 255 / 0.1); }
    .p-head { display: flex; align-items: center; gap: 0.9rem; }
    h3 { margin: 0; font-size: 1.5rem; }
    .lore { margin: 0.15rem 0 0; color: #d58ae0; font-style: italic; }
    .cmds { display: flex; flex-wrap: wrap; gap: 0.35rem; margin: 0.9rem 0 0; padding: 0; list-style: none; }
    .cmds code { padding: 0.15rem 0.45rem; background: rgb(255 255 85 / 0.12); color: var(--color-mc-yellow); font-size: 0.85rem; }
    .sides { display: flex; flex-direction: column; gap: 0.9rem; margin: 1rem 0 1.1rem; }
    .label { display: block; margin-bottom: 0.3rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: #aaa; }
    .dc-box { padding: 0.5rem 0.9rem; border-radius: 8px; background: var(--color-dc); color: var(--color-dc-text); }
    .dc-box :global(.embed) { max-width: 100%; }
    .mc-box { padding: 0.75rem; background: linear-gradient(#78a6f7, #b4d3ff); border: 3px solid #000; font-size: 0.9rem; }
</style>
