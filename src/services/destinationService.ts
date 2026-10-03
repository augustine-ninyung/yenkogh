import type { Destination, SearchParams, SortOption } from '@/types';
import {
  destinations,
  getFeaturedDestinations,
  getDestinationById,
  getDestinationBySlug,
  getDestinationsByRegion,
  searchDestinations,
} from '@/data/destinations';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const destinationService = {
  async getAll(params?: SearchParams): Promise<Destination[]> {
    await delay(400);
    let result = [...destinations];
    if (params?.query) result = searchDestinations(params.query);
    if (params?.region) result = result.filter((d) => d.regionCode === params.region);
    if (params?.type) result = result.filter((d) => d.type === params.type);
    if (params?.minRating != null) result = result.filter((d) => d.rating >= params.minRating!);
    if (params?.maxCost != null)
      result = result.filter((d) => d.estimatedCostPerPerson <= params.maxCost!);
    if (params?.minCost != null)
      result = result.filter((d) => d.estimatedCostPerPerson >= params.minCost!);
    if (params?.tags?.length)
      result = result.filter((d) => params.tags!.some((t) => d.tags.includes(t)));
    return result;
  },

  async getById(id: string): Promise<Destination | null> {
    await delay(200);
    return getDestinationById(id) ?? null;
  },

  async getBySlug(slug: string): Promise<Destination | null> {
    await delay(200);
    return getDestinationBySlug(slug) ?? null;
  },

  async getFeatured(): Promise<Destination[]> {
    await delay(300);
    return getFeaturedDestinations();
  },

  async search(query: string): Promise<Destination[]> {
    await delay(200);
    return searchDestinations(query);
  },

  async getByRegion(regionCode: string): Promise<Destination[]> {
    await delay(300);
    return getDestinationsByRegion(regionCode);
  },

  async getSorted(list: Destination[], sort: SortOption): Promise<Destination[]> {
    const copy = [...list];
    switch (sort) {
      case 'name-asc':
        return copy.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return copy.sort((a, b) => b.name.localeCompare(a.name));
      case 'rating-desc':
        return copy.sort((a, b) => b.rating - a.rating);
      case 'cost-asc':
        return copy.sort((a, b) => a.estimatedCostPerPerson - b.estimatedCostPerPerson);
      case 'cost-desc':
        return copy.sort((a, b) => b.estimatedCostPerPerson - a.estimatedCostPerPerson);
      default:
        return copy;
    }
  },
};
