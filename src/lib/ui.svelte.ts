import type { Item } from './data/items';

/** One shared tooltip, like Minecraft's: follows the pointer, or sits next to a focused slot. */
class TooltipState {
    item = $state<Item | null>(null);
    extra = $state<string[]>([]);
    x = $state(0);
    y = $state(0);

    show(item: Item, e: PointerEvent | FocusEvent, extra: string[] = []) {
        this.item = item;
        this.extra = extra;
        this.move(e);
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

export type Toast = { id: number; title: string; name: string; icon: Item['icon'] };

/** "Advancement Made!" toasts in the top right. */
class ToastState {
    list = $state<Toast[]>([]);
    private seen = new Set<string>();
    private id = 0;

    advancement(name: string, icon: Item['icon'], title = 'Advancement Made!') {
        if(this.seen.has(name)) return;
        this.seen.add(name);
        const t = { id: ++this.id, title, name, icon };
        // At most two at a time, so they never cover much of the page.
        this.list = [...this.list.slice(-1), t];
        setTimeout(() => { this.list = this.list.filter(x => x.id !== t.id); }, 4200);
    }
}

export const toasts = new ToastState();
