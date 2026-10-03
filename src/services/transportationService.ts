import type { Transportation, TransportType } from '@/types';
import {
  transportation,
  getTransportationById,
  getTransportationByType,
  searchTransportRoutes,
} from '@/data/transportation';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const transportationService = {
  async getAll(): Promise<Transportation[]> {
    await delay(300);
    return transportation;
  },

  async getById(id: string): Promise<Transportation | null> {
    await delay(200);
    return getTransportationById(id) ?? null;
  },

  async getByType(type: TransportType): Promise<Transportation[]> {
    await delay(200);
    return getTransportationByType(type);
  },

  async searchRoutes(from: string, to: string): Promise<Transportation[]> {
    await delay(400);
    return searchTransportRoutes(from, to);
  },
};
