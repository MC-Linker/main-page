import type { Item } from './mc/item';

/** One shared tooltip, like Minecraft's: follows the pointer, or sits next to a focused slot. */
class TooltipState {
    item = $state<Item | null>(null);
    extra = $state<string[]>([]);
    x = $state(0);
    y = $state(0);
    /** `above`: centred over an element (the hotbar), instead of next to the pointer. */
    above = $state(false);

    show(item: Item, e: PointerEvent | FocusEvent, extra: string[] = []) {
        this.item = item;
        this.extra = extra;
        this.above = false;
        this.move(e);
    }

    showAbove(item: Item, el: HTMLElement, extra: string[] = []) {
        const r = el.getBoundingClientRect();
        this.item = item;
        this.extra = extra;
        this.above = true;
        this.x = r.left + r.width / 2;
        this.y = r.top;
    }

    move(e: PointerEvent | FocusEvent) {
        if('clientX' in e) {
            this.x = e.clientX;
            this.y = e.clientY;
        }
        else {
            const r = (e.target as HTMLElement).getBoundingClientRect();
            this.x = r.right;
            this.y = r.top;
        }
    }

    hide() {
        this.item = null;
    }
}

export const tooltip = new TooltipState();

type TooltipOptions = {
    /** More lines under the item's own, with formatting codes. */
    extra?: string[];
    /** Centre the tooltip above the element, instead of following the pointer. */
    above?: boolean;
    /** Also show it when the element gets keyboard focus. */
    focus?: boolean;
    /** Hide it when the element is clicked. */
    hideOnClick?: boolean;
};

/**
 * Event handlers that show `item`'s tooltip for a mouse pointer or keyboard focus.
 * Spread them onto the element. Touch never shows tooltips: a tap would leave them stuck.
 */
export function tooltipHandlers(item: Item, { extra = [], above = false, focus = true, hideOnClick = false }: TooltipOptions = {}) {
    const show = (e: PointerEvent | FocusEvent) => {
        if(above) tooltip.showAbove(item, e.currentTarget as HTMLElement, extra);
        else tooltip.show(item, e, extra);
    };
    const hide = () => tooltip.hide();
    return {
        onpointerenter: (e: PointerEvent) => {
            if(e.pointerType === 'mouse') show(e);
        },
        onpointerleave: hide,
        ...(above ? {} : {
            onpointermove: (e: PointerEvent) => {
                if(e.pointerType !== 'mouse') return;
                if(tooltip.item === item) tooltip.move(e);
                else show(e);
            },
        }),
        ...(focus ? {
            onfocus: (e: FocusEvent) => {
                if((e.currentTarget as HTMLElement).matches(':focus-visible')) show(e);
            },
            onblur: hide,
        } : {}),
        ...(hideOnClick ? { onclick: hide } : {}),
    };
}
