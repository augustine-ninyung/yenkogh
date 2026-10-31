import { supabase } from '@/lib/supabase';
import { regions } from '@/data/regions';
import { localDb } from '@/services/content/localDb';
import { rowToTourGuide, type TourGuideRow } from '@/services/content/resources';
import type { TourGuide } from '@/types';

// The public list of tour guides. The database only returns published guides
// to the public, and a guide cannot be published until verified.

const toGuides = (rows: TourGuideRow[]): TourGuide[] =>
  rows
    .map((row) => rowToTourGuide(row, regions.find((r) => r.id === row.region_id)?.name ?? row.region_id))
    .sort((a, b) => a.name.localeCompare(b.name));

export const tourGuideService = {
  async listPublished(): Promise<TourGuide[]> {
    if (supabase) {
      const { data, error } = await supabase.from('tour_guides').select('*').eq('status', 'published');
      if (error) throw new Error('Could not load tour guides. Please try again.', { cause: error });
      return toGuides((data ?? []) as TourGuideRow[]);
    }
    return toGuides(localDb.rows('tour_guides').filter((g) => g.status === 'published'));
  },
};
