import type { Item } from './data/items';

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

    hide() { this.item = null; }
}

export const tooltip = new TooltipState();
