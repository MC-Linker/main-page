/**
 * discord-components lays embeds out for wide chat windows. In narrow columns (phones, the
 * item preview) they overflow and get cut off: inline fields have a minimum width of 150px (now 5rem),
 * and embed images are fixed at up to 300px. Let both shrink with their column, like Discord does.
 * Call once in the browser, after the components are registered.
 */
const fixes: Record<string, string> = {
    'discord-embed-field': ':host .discord-inline-field { min-width: 5rem; }',
    'discord-embed': `
        :host .discord-embed-wrapper { min-width: 0; max-width: 100%; }
        :host .discord-embed-grid { min-width: 0; }
        :host .discord-embed-media { min-width: 0; }
        :host .discord-embed-image { max-width: 100%; height: auto; }`,
};

export async function fixNarrowEmbeds() {
    for(const [tag, css] of Object.entries(fixes)) {
        const Element = (await customElements.whenDefined(tag)) as typeof import('lit').LitElement;
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        const adopt = (el: import('lit').LitElement) => {
            const root = el.renderRoot as ShadowRoot;
            root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
        };
        // Elements made from now on, and the ones already on the page.
        Element.addInitializer(el => el.addController({ hostConnected: () => adopt(el as import('lit').LitElement) }));
        document.querySelectorAll<import('lit').LitElement>(tag).forEach(el => el.renderRoot && adopt(el));
    }
}
