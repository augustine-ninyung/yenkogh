import type { Event, EventFilterParams } from '@/types';
import {
  events,
  getFeaturedEvents,
  getUpcomingEvents,
  getEventById,
  getEventBySlug,
  getEventsByCategory,
  searchEvents,
} from '@/data/events';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const eventService = {
  async getAll(params?: EventFilterParams): Promise<Event[]> {
    await delay(400);
    let result = [...events];
    if (params?.query) result = searchEvents(params.query);
    if (params?.category) result = result.filter((e) => e.category === params.category);
    if (params?.region) result = result.filter((e) => e.regionCode === params.region);
    if (params?.isFree != null) result = result.filter((e) => e.isFree === params.isFree);
    return result;
  },

  async getById(id: string): Promise<Event | null> {
    await delay(200);
    return getEventById(id) ?? null;
  },

  async getBySlug(slug: string): Promise<Event | null> {
    await delay(200);
    return getEventBySlug(slug) ?? null;
  },

  async getFeatured(): Promise<Event[]> {
    await delay(300);
    return getFeaturedEvents();
  },

  async getUpcoming(): Promise<Event[]> {
    await delay(300);
    return getUpcomingEvents();
  },

  async search(query: string): Promise<Event[]> {
    await delay(200);
    return searchEvents(query);
  },

  async getByCategory(category: string): Promise<Event[]> {
    await delay(200);
    return getEventsByCategory(category);
  },
};
