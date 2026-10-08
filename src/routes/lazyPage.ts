import { lazy, type ComponentType } from 'react';

const RELOADED_KEY = 'yenkogh_reloaded_for_page';

/**
 * A page that is fetched the first time it is opened.
 *
 * If the fetch fails, the usual cause is that the site was updated while this
 * tab was open, so the file the tab is asking for no longer exists. Reloading
 * picks up the new version. It is tried once per page, so a real outage shows
 * an error instead of reloading for ever.
 */
export function lazyPage<T extends ComponentType<object>>(load: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      const page = await load();
      sessionStorage.removeItem(RELOADED_KEY);
      return page;
    } catch (err) {
      if (sessionStorage.getItem(RELOADED_KEY) !== window.location.pathname) {
        sessionStorage.setItem(RELOADED_KEY, window.location.pathname);
        window.location.reload();
        // Keep showing the loading state until the reload takes over
        return new Promise<{ default: T }>(() => undefined);
      }
      throw err;
    }
  });
}
