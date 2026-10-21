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

// ─── Site traffic ─────────────────────────────────────────────────────────────
// Anonymous daily totals by page type, referring site and screen size, for the
// admin Traffic page. See pageView.ts for how each value is reduced first.

const LOCAL_TRAFFIC_KEY = 'yenkogh_db_page_views';

/** One stored total, as the database keeps it. */
export interface PageViewTotal {
  day: string;
  path: string;
  referrer: string;
  device: 'mobile' | 'tablet' | 'desktop';
  views: number;
}

export const localPageViews = (): PageViewTotal[] => readJson<PageViewTotal[]>(localStorage, LOCAL_TRAFFIC_KEY, []);

/** Records one page view. Never throws: a missed count must not get in the way of the page. */
export function recordPageView(path: string, referrer: string, device: PageViewTotal['device']): void {
  try {
    if (supabase) {
      void supabase
        .rpc('record_page_view', { p_path: path, p_referrer: referrer, p_device: device })
        .then(() => undefined, () => undefined);
      return;
    }
    const day = new Date().toISOString().slice(0, 10);
    const totals = localPageViews();
    const row = totals.find((t) => t.day === day && t.path === path && t.referrer === referrer && t.device === device);
    if (row) row.views += 1;
    else totals.push({ day, path, referrer, device, views: 1 });
    localStorage.setItem(LOCAL_TRAFFIC_KEY, JSON.stringify(totals.slice(-5000)));
  } catch {
    // Storage can be unavailable (private windows); the page still works
  }
}
