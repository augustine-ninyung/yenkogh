import { supabase } from '@/lib/supabase';

// Counts visits to destination pages, for the admin dashboard's "most viewed"
// list. Only a daily total per destination is kept: nothing about who looked.

const SEEN_KEY = 'yenkogh_viewed_destinations';
const LOCAL_VIEWS_KEY = 'yenkogh_db_destination_views';

/** Daily totals kept in this browser when there is no backend: { destinationId: { 'YYYY-MM-DD': count } } */
type LocalViews = Record<string, Record<string, number>>;

const readJson = <T,>(storage: Storage, key: string, fallback: T): T => {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const localDestinationViews = (): LocalViews => readJson<LocalViews>(localStorage, LOCAL_VIEWS_KEY, {});

/**
 * Records one view of a destination. A page reopened in the same browser
 * session is not counted again. Never throws: a missed count must not get in
 * the way of reading the page.
 */
export function recordDestinationView(destinationId: string): void {
  try {
    const seen = readJson<string[]>(sessionStorage, SEEN_KEY, []);
    if (seen.includes(destinationId)) return;
    sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen, destinationId]));

    if (supabase) {
      void supabase.rpc('record_destination_view', { p_destination: destinationId }).then(() => undefined, () => undefined);
      return;
    }
    const views = localDestinationViews();
    const today = new Date().toISOString().slice(0, 10);
    views[destinationId] = { ...views[destinationId], [today]: (views[destinationId]?.[today] ?? 0) + 1 };
    localStorage.setItem(LOCAL_VIEWS_KEY, JSON.stringify(views));
  } catch {
    // Storage can be unavailable (private windows); the page still works
  }
}
