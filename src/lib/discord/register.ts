import { fixNarrowEmbeds } from './narrow';

let loading: Promise<void> | undefined;

/**
 * Registers the Discord message elements (Lit web components, about 80 KB gzipped) and their
 * narrow-column fixes. Browser only, once; called by the pages that show Discord messages.
 */
export function registerDiscord() {
    loading ??= import('@skyra/discord-components-core').then(fixNarrowEmbeds);
    return loading;
}
