<script lang="ts" module>
    /** Which page of an open spread, or `single` when one page shows at a time. */
    export type PageSide = 'left' | 'right' | 'single';
</script>

<script lang="ts">
    import type { Snippet } from 'svelte';
    import { fly } from 'svelte/transition';
    import { reducedMotion } from '$lib/browser';
    import OreButton from '$lib/ore/OreButton.svelte';
    import { backArrow, chevronRight } from '$lib/ore/sprites';
    import PixelArt from '$lib/pixel/PixelArt.svelte';

    /**
     * A Minecraft written book. Shows two pages side by side (`spread`) or one at a time.
     * Turn pages with its Ore UI buttons, the arrow keys while it has focus, or a swipe.
     * `page` draws page `n`; its `go` jumps to any page.
     */
    type Props = {
        count: number;
        label: string;
        spread?: boolean;
        page: Snippet<[number, { go: (n: number) => void; side: PageSide }]>;
    };
    let { count, label, spread = false, page: pageContent }: Props = $props();

    const perView = $derived(spread ? 2 : 1);
    let current = $state(0);
    /** The direction of the last turn, for the slide-in. */
    let dir = $state(1);
    const first = $derived(current - (current % perView));
    const shown = $derived(Array.from({ length: Math.min(perView, count - first) }, (_, i) => first + i));
    const canBack = $derived(first > 0);
    const canNext = $derived(first + perView < count);

    function go(n: number) {
        const target = Math.max(0, Math.min(count - 1, n));
        dir = target >= current ? 1 : -1;
        current = target;
    }
    const turn = (step: number) => go(first + step * perView);

    function keys(e: KeyboardEvent) {
        if(e.key === 'ArrowRight') {
            e.preventDefault();
            if(canNext) turn(1);
        }
        if(e.key === 'ArrowLeft') {
            e.preventDefault();
            if(canBack) turn(-1);
        }
    }

    // Swipe to turn pages on touch screens.
    let startX = 0;
    const down = (e: PointerEvent) => {
        startX = e.pointerType === 'mouse' ? NaN : e.clientX;
    };
    function up(e: PointerEvent) {
        const dx = e.clientX - startX;
        if(Number.isNaN(dx) || Math.abs(dx) < 50) return;
        if(dx < 0 && canNext) turn(1);
        if(dx > 0 && canBack) turn(-1);
    }

    const noSelect = (e: MouseEvent) => e.preventDefault();

    const sideOf = (i: number): PageSide => (!spread ? 'single' : i === 0 ? 'left' : 'right');
</script>

<div class="book-wrap" class:spread>
    <!-- The book can be focused to turn pages with the arrow keys. -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
    <div
        class="book"
        class:spread
        role="region"
        aria-roledescription="book"
        aria-label={label}
        tabindex="0"
        onkeydown={keys}
        onpointerdown={down}
        onpointerup={up}
    >
        <div class="pages">
            {#each shown as n, i (n)}
                <div class="page" class:left={sideOf(i) === 'left'} class:right={sideOf(i) === 'right'} aria-live="polite">
                    <div class="content" in:fly={{ x: reducedMotion.current ? 0 : 14 * dir, duration: 220 }}>
                        <p class="pageno">Page {n + 1} of {count}</p>
                        {@render pageContent(n, { go, side: sideOf(i) })}
                    </div>
                </div>
            {/each}
            {#if shown.length < perView}<div class="page right blank" aria-hidden="true"></div>{/if}
        </div>
        <!-- The other pages, hidden but in the page: search engines read them, and the browser's
             find (Ctrl+F) can reach them, which turns the book to that page. -->
        {#each { length: count }, n (n)}
            {#if !shown.includes(n)}
                <div class="found" hidden="until-found" onbeforematch={() => go(n)}>{@render pageContent(n, { go, side: 'single' })}</div>
            {/if}
        {/each}
        <!-- The page-turn buttons, in Ore UI style. -->
        <!-- Pressing a turn button never selects text, even when clicked fast or once it is hidden. -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="turn back" class:gone={!canBack} onmousedown={noSelect}>
            <OreButton variant="secondary" size="sm" onclick={() => turn(-1)} disabled={!canBack} label="Previous page">
                <span class="chev"><PixelArt sprite={backArrow()} width="100%" /></span>
            </OreButton>
        </div>
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="turn next" class:gone={!canNext} onmousedown={noSelect}>
            <OreButton variant="secondary" size="sm" onclick={() => turn(1)} disabled={!canNext} label="Next page">
                <span class="chev"><PixelArt sprite={chevronRight('#000000')} width="100%" /></span>
            </OreButton>
        </div>
    </div>
</div>

<style>
    .book-wrap {
        /* One pixel of the book texture. */
        --u: 3px;
        width: min(27rem, 100%);
        margin: 0 auto;
        /* A one-pixel outline that follows the stepped corners, then a soft shadow. */
        filter:
            drop-shadow(var(--u) 0 0 #24140a) drop-shadow(calc(var(--u) * -1) 0 0 #24140a)
            drop-shadow(0 var(--u) 0 #24140a) drop-shadow(0 calc(var(--u) * -1) 0 #24140a)
            drop-shadow(0 1.25rem 1.5rem rgb(0 0 0 / 0.5));
    }
    .book-wrap.spread { --u: 4px; width: min(54rem, 100%); }
    /* Only ever shown for an instant, while find reveals it before the book turns to it. */
    .found { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
    .book {
        --page: #f4ebd3;
        --page-shade-1: #e9dcbc;
        --page-shade-2: #dccba3;
        --page-edge: #c2ab7e;
        --cover: #7b4c26;
        --cover-light: #95602f;
        --cover-dark: #4f2e13;
        --ink: #1e1b16;
        position: relative;
        padding: calc(var(--u) * 3) calc(var(--u) * 3) calc(var(--u) * 5) calc(var(--u) * 5);
        background:
            linear-gradient(var(--cover-light) 0 0) top / 100% var(--u) no-repeat,
            linear-gradient(var(--cover-dark) 0 0) bottom / 100% calc(var(--u) * 2) no-repeat,
            var(--cover);
        /* Pixel-stepped corners. */
        clip-path: polygon(
            calc(var(--u) * 2) 0, calc(100% - var(--u) * 2) 0, calc(100% - var(--u) * 2) var(--u), calc(100% - var(--u)) var(--u),
            calc(100% - var(--u)) calc(var(--u) * 2), 100% calc(var(--u) * 2), 100% calc(100% - var(--u) * 2), calc(100% - var(--u)) calc(100% - var(--u) * 2),
            calc(100% - var(--u)) calc(100% - var(--u)), calc(100% - var(--u) * 2) calc(100% - var(--u)), calc(100% - var(--u) * 2) 100%, calc(var(--u) * 2) 100%,
            calc(var(--u) * 2) calc(100% - var(--u)), var(--u) calc(100% - var(--u)), var(--u) calc(100% - var(--u) * 2), 0 calc(100% - var(--u) * 2),
            0 calc(var(--u) * 2), var(--u) calc(var(--u) * 2), var(--u) var(--u), calc(var(--u) * 2) var(--u)
        );
        color: var(--ink);
        font-family: var(--font-pixel);
        font-size: 1rem;
        line-height: 1.5;
        touch-action: pan-y;
        outline: none;
    }
    .book::before {
        /* The spine on the left of a single page. */
        content: ''; position: absolute; top: calc(var(--u) * 3); bottom: calc(var(--u) * 5); left: calc(var(--u) * 2); width: var(--u);
        background: var(--cover-dark);
    }
    .book:focus-visible { outline-offset: calc(var(--u) * 2); }
    .book.spread { padding-left: calc(var(--u) * 3); font-size: 1.15rem; }
    .book.spread::before { display: none; }

    .pages { display: grid; grid-template-columns: 1fr; }
    .spread .pages { grid-template-columns: 1fr 1fr; }
    .page {
        /* Room at the bottom for the page-turn buttons. */
        --pad-bottom: calc(var(--u) * 19);
        position: relative;
        display: flex;
        flex-direction: column;
        min-height: 28rem;
        padding: calc(var(--u) * 6) calc(var(--u) * 7) var(--pad-bottom) calc(var(--u) * 8);
        background:
            /* Shading towards the spine, in hard pixel steps. */
            linear-gradient(90deg, var(--page-shade-2) 0 var(--u), var(--page-shade-1) var(--u) calc(var(--u) * 3), transparent calc(var(--u) * 3)),
            var(--page);
        /* Page edges peeking out below: the rest of the book. */
        box-shadow: 0 var(--u) 0 var(--page-shade-2), 0 calc(var(--u) * 2) 0 var(--page-edge);
    }
    .spread .page { min-height: 30rem; }
    .page.left {
        --pad-bottom: calc(var(--u) * 17);
        padding: calc(var(--u) * 6) calc(var(--u) * 9) var(--pad-bottom) calc(var(--u) * 7);
        background:
            linear-gradient(270deg, var(--page-shade-2) 0 var(--u), var(--page-shade-1) var(--u) calc(var(--u) * 4), transparent calc(var(--u) * 4)),
            var(--page);
    }
    .page.right {
        --pad-bottom: calc(var(--u) * 17);
        padding: calc(var(--u) * 6) calc(var(--u) * 7) var(--pad-bottom) calc(var(--u) * 9);
        background:
            linear-gradient(90deg, var(--page-shade-2) 0 var(--u), var(--page-shade-1) var(--u) calc(var(--u) * 4), transparent calc(var(--u) * 4)),
            var(--page);
    }
    /* Fills the page, so anything pinned to the bottom stays there while the page slides in. */
    .content { position: relative; flex: 1; }
    .pageno { margin: 0 0 calc(var(--u) * 4); text-align: right; font-size: 0.9em; color: #4d4535; }

    .turn { position: absolute; bottom: calc(var(--u) * 8); }
    .turn.back { left: calc(var(--u) * 9); }
    .turn.next { right: calc(var(--u) * 8); }
    /* At the first or last page the button stays in place, just invisible and inert,
       so fast clicks land on it rather than on the page text behind. */
    .turn { user-select: none; transition: opacity 0.15s; }
    .turn.gone { opacity: 0; }
    .turn.gone :global(.ore-btn) { pointer-events: none; }
    .turn :global(.ore-btn) { width: 2.75rem; padding-inline: 0; }
    .chev { display: block; width: calc(4 * var(--t)); }
</style>
