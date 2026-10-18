<script lang="ts">
    import { fly, scale } from 'svelte/transition';
    import { ingredients, result, type Item } from '$lib/craft/items';
    import { toasts, tooltip } from '$lib/craft/ui.svelte';
    import { links } from '$lib/data/links';
    import { reducedMotion, sleep } from '$lib/motion';
    import { book } from '$lib/pixel/items';
    import McButton from '$lib/mc/McButton.svelte';
    import McChat from '$lib/mc/McChat.svelte';
    import BrandIcon from '../BrandIcon.svelte';
    import ItemIcon from './ItemIcon.svelte';
    import Slot from './Slot.svelte';

    const empty = () => Array<Item | null>(9).fill(null);
    let inventory = $state<(Item | null)[]>([...ingredients, ...Array(6).fill(null)]);
    let grid = $state<(Item | null)[]>(empty());
    let held = $state<Item | null>(null);
    let crafted = $state(0);
    let pointer = $state({ x: -100, y: -100 });
    let orbs = $state<{ id: number; dx: number; dy: number }[]>([]);
    let resultSlot = $state<HTMLElement>();

    // Shapeless recipe: one of each ingredient, anywhere in the grid.
    const valid = $derived.by(() => {
        const ids = grid.filter(Boolean).map(i => i!.id).sort();
        return ids.length === 3 && ids.join() === ingredients.map(i => i.id).sort().join();
    });

    function clickSlot(list: (Item | null)[], i: number) {
        const here = list[i];
        list[i] = held;
        held = here;
        tooltip.hide();
    }

    function craft() {
        if(!valid) return;
        tooltip.hide();
        grid = empty();
        crafted++;
        const free = inventory.indexOf(null);
        if(free >= 0) inventory[free] = result;
        else held = result;
        toasts.advancement('Linked Up!', result.icon);
        burst();
    }

    function burst() {
        if(reducedMotion.current) return;
        const base = Date.now();
        orbs = Array.from({ length: 10 }, (_, i) => ({ id: base + i, dx: (Math.random() - 0.5) * 160, dy: -40 - Math.random() * 90 }));
        setTimeout(() => (orbs = []), 1100);
    }

    /** The recipe book: moves the ingredients into the middle row for you. */
    async function autofill() {
        if(held) { const free = inventory.indexOf(null); if(free >= 0) inventory[free] = held; held = null; }
        for(const [n, ing] of ingredients.entries()) {
            const from = inventory.findIndex(i => i?.id === ing.id);
            const inGrid = grid.some(g => g?.id === ing.id);
            if(inGrid) continue;
            if(from < 0) continue;
            inventory[from] = null;
            const target = grid[3 + n] === null ? 3 + n : grid.indexOf(null);
            grid[target] = ing;
            await sleep(reducedMotion.current ? 0 : 160);
        }
    }

    function reset() {
        inventory = [...ingredients, ...Array(6).fill(null)];
        grid = empty();
        held = null;
    }

    const steps = $derived([
        { done: grid.some(g => g?.id === 'mc-server') && grid.some(g => g?.id === 'plugin') || crafted > 0 },
        { done: grid.some(g => g?.id === 'discord') || crafted > 0 },
        { done: crafted > 0 },
    ]);
</script>

<svelte:window onpointermove={e => (pointer = { x: e.clientX, y: e.clientY })} />

<section id="craft" class="craft" aria-labelledby="craft-title">
    <header class="head">
        <h2 id="craft-title" class="mc-text">Craft your link</h2>
        <p>Every link takes three ingredients. Click them into the grid, then take the result.</p>
    </header>

    <div class="layout">
        <div class="mc-panel gui" role="application" aria-label="Crafting table">
            <p class="mc-panel-title">Crafting</p>
            <div class="table">
                <button class="recipe" type="button" onclick={autofill} aria-label="Recipe book: fill in the recipe for me" title="Recipe book">
                    <ItemIcon icon={{ sprite: book }} size="1.6rem" />
                </button>
                <div class="grid" role="group" aria-label="Crafting grid">
                    {#each grid as item, i (i)}
                        <Slot {item} label={item ? `${item.name} in grid slot ${i + 1}` : `Grid slot ${i + 1}`} onclick={() => clickSlot(grid, i)} />
                    {/each}
                </div>
                <span class="arrow" aria-hidden="true"></span>
                <div class="result" bind:this={resultSlot}>
                    <Slot item={valid ? result : null} size="3.5rem" label={valid ? 'Take MC Linker' : 'Result (empty)'} onclick={craft} class={valid ? 'ready' : ''} />
                    {#each orbs as o (o.id)}<span class="orb" style:--dx="{o.dx}px" style:--dy="{o.dy}px" aria-hidden="true"></span>{/each}
                </div>
            </div>
            <p class="mc-panel-title inv-title">Inventory</p>
            <div class="inventory" role="group" aria-label="Inventory">
                {#each inventory as item, i (i)}
                    <Slot {item} label={item ? `${item.name} in inventory slot ${i + 1}` : `Inventory slot ${i + 1}`} onclick={() => clickSlot(inventory, i)} />
                {/each}
            </div>
            <p class="status" aria-live="polite">
                {#if held}Holding <b>{held.name}</b>. Click a slot to put it down.
                {:else if valid}Ready! Click the result to craft.
                {:else if crafted}Crafted {crafted}× MC Linker. <button type="button" class="link" onclick={reset}>Start over</button>
                {:else}Tip: the book on the left fills in the recipe.{/if}
            </p>
        </div>

        <ol class="steps">
            <li class:done={steps[0].done}>
                <span class="num mc-text">1</span>
                <div>
                    <h3>Minecraft Server + Discord-Linker</h3>
                    <p>Drop the Discord-Linker plugin into your server's <code>plugins</code> or <code>mods</code> folder and restart.</p>
                    <McButton href="#servers">Get the plugin</McButton>
                </div>
            </li>
            <li class:done={steps[1].done}>
                <span class="num mc-text">2</span>
                <div>
                    <h3>Discord Server</h3>
                    <p>Add MC Linker to the Discord server you want to link.</p>
                    <a class="dc-btn" href={links.invite} target="_blank" rel="noopener"><BrandIcon brand="discord" size="1.1em" /> Add to Discord</a>
                </div>
            </li>
            <li class:done={steps[2].done}>
                <span class="num mc-text">3</span>
                <div>
                    <h3>Craft it with <code>/connect</code></h3>
                    <p>Run <code>/connect</code> in Discord and paste the code it gives you into Minecraft. Done.</p>
                    <McChat lines={[{ id: 1, text: '&f/linker connect 803412896432:a8f3c' }, { id: 2, text: '&aSuccessfully connected to Discord!' }]} />
                </div>
            </li>
        </ol>
    </div>

    {#if held}
        <div class="held" style:left="{pointer.x}px" style:top="{pointer.y}px" aria-hidden="true" transition:scale={{ duration: 120 }}>
            <ItemIcon icon={held.icon} glint={held.glint} size="2.2rem" />
        </div>
    {/if}
</section>

<style>
    .craft { padding: clamp(4rem, 9vw, 7rem) 1rem; }
    .head { text-align: center; margin-bottom: 2.5rem; }
    h2 { margin: 0; font-size: clamp(2rem, 5vw, 3.25rem); color: #fff; }
    .head p { margin: 0.75rem auto 0; max-width: 32rem; color: #ccc; }

    .layout { display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; gap: 2.5rem; max-width: 64rem; margin: 0 auto; }
    .gui { --slot: clamp(2.15rem, 8.6vw, 2.75rem); width: max-content; max-width: 100%; }
    .table { display: flex; align-items: center; gap: 0.75rem; }
    .recipe {
        display: grid; place-items: center; width: 2.4rem; height: 2.4rem; padding: 0; cursor: pointer;
        background: #a8e06a; border: 2px solid #000; box-shadow: inset 2px 2px 0 #d8ffb0, inset -2px -2px 0 #4f7a1c;
        animation: nudge 2.4s ease-in-out infinite;
    }
    .recipe:hover { filter: brightness(1.1); }
    @keyframes nudge { 0%, 85%, 100% { transform: none; } 90% { transform: rotate(-8deg); } 95% { transform: rotate(8deg); } }
    .grid { display: grid; grid-template-columns: repeat(3, var(--slot)); gap: 2px; }
    .arrow { width: 2.2rem; height: 1.6rem; background: #8b8b8b; clip-path: polygon(0 35%, 60% 35%, 60% 0, 100% 50%, 60% 100%, 60% 65%, 0 65%); }
    .result { position: relative; }
    .result :global(.ready) { animation: ready 1s ease-in-out infinite alternate; }
    @keyframes ready { to { box-shadow: inset 2px 2px 0 #373737, inset -2px -2px 0 #fff, 0 0 0 3px #ffff55; } }
    .orb {
        position: absolute; left: 50%; top: 50%; width: 10px; height: 10px; margin: -5px;
        border-radius: 50%; background: radial-gradient(#e6ff8a, #7bc11f 60%, #3e6b0c);
        animation: orb 1s ease-out forwards; pointer-events: none;
    }
    @keyframes orb { to { transform: translate(var(--dx), var(--dy)); opacity: 0; } }
    .inv-title { margin-top: 1rem; }
    .inventory { display: grid; grid-template-columns: repeat(9, var(--slot)); gap: 2px; }
    .status { margin: 0.75rem 0 0; min-height: 1.3em; font-size: 0.85rem; color: #3f3f3f; max-width: calc(9 * var(--slot) + 16px); }
    .link { border: 0; padding: 0; background: none; color: #2a4fb8; text-decoration: underline; cursor: pointer; font: inherit; }

    .steps { display: flex; flex-direction: column; gap: 1.25rem; width: min(26rem, 100%); margin: 0; padding: 0; list-style: none; }
    .steps li { display: flex; gap: 1rem; padding: 1rem; border: 2px solid rgb(255 255 255 / 0.1); background: rgb(0 0 0 / 0.35); transition: border-color 0.3s, background 0.3s; }
    .steps li.done { border-color: var(--color-mc-green); background: rgb(60 110 20 / 0.25); }
    .num {
        display: grid; place-items: center; flex: none; width: 2.2rem; height: 2.2rem;
        background: #555; border: 2px solid #000; color: #fff; font-size: 1.2rem;
    }
    .done .num { background: var(--color-grass); }
    h3 { margin: 0 0 0.35rem; font-size: 1.1rem; color: #fff; }
    .steps p { margin: 0 0 0.75rem; color: #ccc; line-height: 1.5; font-size: 0.95rem; }
    code { padding: 0.05em 0.3em; background: rgb(255 255 255 / 0.12); border-radius: 3px; font-size: 0.9em; }
    .dc-btn { display: inline-flex; align-items: center; gap: 0.5rem; min-height: 2.5rem; padding: 0 1rem; border-radius: 6px; background: var(--color-dc-blurple); color: #fff; font-weight: 700; text-decoration: none; }
    .dc-btn:hover { background: var(--color-dc-blurple-dark); }
    .steps :global(.chat) { font-size: 0.9rem; }

    .held { position: fixed; z-index: 85; pointer-events: none; transform: translate(-50%, -50%); }
</style>
