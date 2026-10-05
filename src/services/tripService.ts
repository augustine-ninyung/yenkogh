import type { Trip, Itinerary } from '@/types';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY = 'yenkogh_trips';
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ─── Backend (Supabase) ───────────────────────────────────────────────────────

/** A row of the `trips` table. */
interface TripRow {
  id: string;
  user_id: string;
  name: string;
  destinations: string[];
  start_date: string;
  end_date: string;
  number_of_travelers: number;
  status: Trip['status'];
  itinerary: Itinerary | null;
  festival_id: string | null;
  accommodations: Trip['accommodations'] | null;
  budget_id: string | null;
  notes: string | null;
  created_at: string;
}

const rowToTrip = (row: TripRow): Trip => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  destinations: row.destinations ?? [],
  startDate: row.start_date,
  endDate: row.end_date,
  numberOfTravelers: row.number_of_travelers,
  status: row.status,
  itinerary: row.itinerary ?? undefined,
  festivalId: row.festival_id ?? undefined,
  accommodations: row.accommodations ?? [],
  budgetId: row.budget_id ?? undefined,
  notes: row.notes ?? undefined,
  createdAt: row.created_at,
});

/** Only the fields present in `trip` are written, so partial updates leave the rest alone. */
const tripToRow = (trip: Partial<Trip>): Partial<TripRow> => {
  const row: Partial<TripRow> = {};
  if (trip.userId !== undefined) row.user_id = trip.userId;
  if (trip.name !== undefined) row.name = trip.name;
  if (trip.destinations !== undefined) row.destinations = trip.destinations;
  if (trip.startDate !== undefined) row.start_date = trip.startDate;
  if (trip.endDate !== undefined) row.end_date = trip.endDate;
  if (trip.numberOfTravelers !== undefined) row.number_of_travelers = trip.numberOfTravelers;
  if (trip.status !== undefined) row.status = trip.status;
  if ('itinerary' in trip) row.itinerary = trip.itinerary ?? null;
  if ('festivalId' in trip) row.festival_id = trip.festivalId ?? null;
  if (trip.accommodations !== undefined) row.accommodations = trip.accommodations;
  if ('budgetId' in trip) row.budget_id = trip.budgetId ?? null;
  if ('notes' in trip) row.notes = trip.notes ?? null;
  return row;
};

// ─── Local fallback ───────────────────────────────────────────────────────────

function readAll(): Trip[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Trip[];
  } catch {
    return [];
  }
}

function writeAll(trips: Trip[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

// ─── Trip Service ─────────────────────────────────────────────────────────────

export const tripService = {
  async getAll(userId: string): Promise<Trip[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      if (error) throw new Error(error.message);
      return (data as TripRow[]).map(rowToTrip);
    }
    await delay(300);
    return readAll().filter((t) => t.userId === userId);
  },

  async getById(id: string): Promise<Trip | null> {
    if (supabase) {
      const { data, error } = await supabase.from('trips').select('*').eq('id', id).maybeSingle();
      // A malformed id (for example one from the local fallback) is simply "not found"
      if (error) return null;
      return data ? rowToTrip(data as TripRow) : null;
    }
    await delay(200);
    return readAll().find((t) => t.id === id) ?? null;
  },

  async create(userId: string, trip: Omit<Trip, 'id' | 'createdAt'>): Promise<Trip> {
    if (supabase) {
      const { data, error } = await supabase
        .from('trips')
        .insert({ ...tripToRow(trip), user_id: userId })
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      return rowToTrip(data as TripRow);
    }
    await delay(400);
    const newTrip: Trip = {
      ...trip,
      id: `trip-${Date.now()}`,
      userId,
      createdAt: new Date().toISOString(),
    };
    writeAll([...readAll(), newTrip]);
    return newTrip;
  },

  async update(id: string, updates: Partial<Trip>): Promise<Trip> {
    if (supabase) {
      // The owner never changes, and the database would reject it anyway
      const row = tripToRow(updates);
      delete row.user_id;
      const { data, error } = await supabase.from('trips').update(row).eq('id', id).select('*').single();
      if (error) throw new Error(error.message);
      return rowToTrip(data as TripRow);
    }
    await delay(300);
    const all = readAll();
    const idx = all.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Trip not found');
    all[idx] = { ...all[idx], ...updates };
    writeAll(all);
    return all[idx];
  },

  async delete(id: string): Promise<void> {
    if (supabase) {
      // The trip's budget goes with it (on delete cascade)
      const { error } = await supabase.from('trips').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return;
    }
    await delay(300);
    writeAll(readAll().filter((t) => t.id !== id));
  },

  async saveItinerary(tripId: string, itinerary: Itinerary): Promise<Trip> {
    return tripService.update(tripId, { itinerary });
  },
};
