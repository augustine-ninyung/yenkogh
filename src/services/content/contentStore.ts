import { destinations } from '@/data/destinations';
import { events } from '@/data/events';
import { festivals } from '@/data/festivals';
import { regions } from '@/data/regions';
import { transportation } from '@/data/transportation';
import { supabase } from '@/lib/supabase';
import { localDb } from './localDb';
import {
  rowToDestination,
  rowToEvent,
  rowToFestival,
  rowToRegion,
  rowToTransport,
  type ContentTable,
  type RowByTable,
} from './resources';

// The public site reads its content from the arrays in src/data. Those arrays
// start as the content that ships with the app; this module replaces what is
// in them with the published rows from the database, so the database is the
// source of truth wherever one is connected.
//
// If the database is unreachable, empty, or not configured, the bundled
// content simply stays in place and the site still works.

const LOAD_TIMEOUT_MS = 6000;

/** Published rows of a table in site order, or null to keep the bundled content. */
async function publishedRows<T extends ContentTable>(table: T): Promise<RowByTable[T][] | null> {
  if (supabase) {
    let query = supabase.from(table).select('*');
    // Regions have no draft state; everything else shows only what is published
    if (table !== 'regions') query = query.eq('status', 'published');
    const { data, error } = await query.order('position', { ascending: true }).order('name', { ascending: true });
    if (error) throw new Error(error.message);
    return data as RowByTable[T][];
  }

  if (!localDb.isModified(table)) return null;
  const rows = localDb.rows(table);
  const visible = table === 'regions' ? rows : rows.filter((r) => (r as { status?: string }).status === 'published');
  return [...visible].sort((a, b) => a.position - b.position || a.name.localeCompare(b.name));
}

/** Swaps an array's contents in place, so every module holding it sees the new content. */
function replace<T>(target: T[], next: T[]): void {
  target.splice(0, target.length, ...next);
}

async function load(): Promise<void> {
  const [regionRows, destinationRows, eventRows, festivalRows, transportRows] = await Promise.all([
    publishedRows('regions'),
    publishedRows('destinations'),
    publishedRows('events'),
    publishedRows('festivals'),
    publishedRows('transport_options'),
  ]);

  // A connected but unseeded database has no regions: keep the bundled content
  if (supabase && (!regionRows || regionRows.length === 0)) return;

  // Rows refer to regions by id, so resolve names against the freshest region list
  const regionLookup =
    regionRows ?? regions.map((r) => ({ id: r.id, name: r.name, code: r.code }));

  if (destinationRows) replace(destinations, destinationRows.map((r) => rowToDestination(r, regionLookup)));
  if (eventRows) replace(events, eventRows.map((r) => rowToEvent(r, regionLookup)));
  if (festivalRows) replace(festivals, festivalRows.map((r) => rowToFestival(r, regionLookup)));
  if (transportRows) replace(transportation, transportRows.map((r) => rowToTransport(r)));

  if (regionRows) {
    replace(
      regions,
      regionRows.map((r) => rowToRegion(r, destinations.filter((d) => d.region === r.name).length)),
    );
  } else if (destinationRows) {
    for (const region of regions) {
      region.destinationCount = destinations.filter((d) => d.region === region.name).length;
    }
  }
}

/**
 * Loads the site's content from the database. Called once before the app
 * renders, and again after an administrator changes something. Never throws:
 * on any failure the content already in place is kept.
 */
export async function hydrateContent(): Promise<void> {
  try {
    await Promise.race([
      load(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timed out loading content')), LOAD_TIMEOUT_MS)),
    ]);
  } catch (err) {
    console.warn('Using the content bundled with the app:', err);
  }
}
