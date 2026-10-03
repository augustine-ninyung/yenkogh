import type { Trip, Itinerary } from '@/types';

const STORAGE_KEY = 'yenkogh_trips';
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

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

export const tripService = {
  async getAll(userId: string): Promise<Trip[]> {
    await delay(300);
    return readAll().filter((t) => t.userId === userId);
  },

  async getById(id: string): Promise<Trip | null> {
    await delay(200);
    return readAll().find((t) => t.id === id) ?? null;
  },

  async create(userId: string, trip: Omit<Trip, 'id' | 'createdAt'>): Promise<Trip> {
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
    await delay(300);
    const all = readAll();
    const idx = all.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Trip not found');
    all[idx] = { ...all[idx], ...updates };
    writeAll(all);
    return all[idx];
  },

  async delete(id: string): Promise<void> {
    await delay(300);
    writeAll(readAll().filter((t) => t.id !== id));
  },

  async saveItinerary(tripId: string, itinerary: Itinerary): Promise<Trip> {
    return tripService.update(tripId, { itinerary });
  },
};
