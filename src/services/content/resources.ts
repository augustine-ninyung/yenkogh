import type { Destination, Event, Festival, Region, Transportation } from '@/types';

// The content tables and how their rows map to the objects the site renders.
//
// Each table keeps what is searched, filtered and sorted in real columns and
// the rest of the page content in a `details` JSON column. This module is pure
// (no network, no browser APIs) so the seed script can share it.

export type ContentTable = 'regions' | 'destinations' | 'events' | 'festivals' | 'transport_options';

export type ContentStatus = 'draft' | 'published' | 'archived';

/** Columns every content row has. */
export interface BaseRow {
  id: string;
  name: string;
  /** Order on the public site; lower comes first */
  position: number;
  created_at: string;
  updated_at: string;
}

export interface RegionRow extends BaseRow {
  code: string;
  capital: string;
  description: string;
  image_url: string;
  color: string;
}

/** Columns shared by the tables that can be drafted, published and archived. */
export interface PublishableRow extends BaseRow {
  description: string;
  image_url: string;
  status: ContentStatus;
  archived_at: string | null;
  details: Record<string, unknown>;
}

export interface DestinationRow extends PublishableRow {
  slug: string;
  region_id: string;
  type: Destination['type'];
  short_description: string;
  estimated_cost: number;
  rating: number;
  review_count: number;
  featured: boolean;
}

export interface EventRow extends PublishableRow {
  slug: string;
  region_id: string;
  category: Event['category'];
  location: string;
  start_date: string;
  end_date: string;
  is_free: boolean;
  ticket_price: number | null;
  short_description: string;
  featured: boolean;
}

export interface FestivalRow extends PublishableRow {
  region_id: string;
  category: Festival['category'];
  town: string;
  ethnic_group: string;
  month: string;
  completeness: Festival['completeness'];
  featured: boolean;
}

export interface TransportRow extends PublishableRow {
  type: Transportation['type'];
}

export type ContentRow = RegionRow | DestinationRow | EventRow | FestivalRow | TransportRow;

export interface RowByTable {
  regions: RegionRow;
  destinations: DestinationRow;
  events: EventRow;
  festivals: FestivalRow;
  transport_options: TransportRow;
}

// ─── Entity → row (used to seed the database and the local fallback) ──────────

/** Timestamp given to the content that ships with the app. */
export const SEED_TIMESTAMP = '2026-01-01T00:00:00.000Z';

const base = (id: string, name: string, position: number): BaseRow => ({
  id,
  name,
  position,
  created_at: SEED_TIMESTAMP,
  updated_at: SEED_TIMESTAMP,
});

const published = { status: 'published' as const, archived_at: null };

/** Region id for a region name; content rows reference regions by id. */
export const regionIdFor = (regions: Pick<Region, 'id' | 'name'>[], name: string): string => {
  const region = regions.find((r) => r.name.toLowerCase() === name.trim().toLowerCase());
  if (!region) throw new Error(`Unknown region "${name}"`);
  return region.id;
};

export const regionToRow = (r: Region, position: number): RegionRow => ({
  ...base(r.id, r.name, position),
  code: r.code,
  capital: r.capital,
  description: r.description,
  image_url: r.imageUrl,
  color: r.color,
});

export const destinationToRow = (d: Destination, position: number, regions: Region[]): DestinationRow => ({
  ...base(d.id, d.name, position),
  ...published,
  slug: d.slug,
  region_id: regionIdFor(regions, d.region),
  type: d.type,
  short_description: d.shortDescription,
  description: d.description,
  image_url: d.imageUrl,
  estimated_cost: d.estimatedCostPerPerson,
  rating: d.rating,
  review_count: d.reviewCount,
  featured: d.featured,
  details: {
    imageCredit: d.imageCredit,
    gallery: d.gallery,
    activities: d.activities,
    thingsToDo: d.thingsToDo,
    openingHours: d.openingHours,
    entryFee: d.entryFee,
    safetyInfo: d.safetyInfo,
    transportOptions: d.transportOptions,
    nearbyDestinations: d.nearbyDestinations,
    latitude: d.latitude,
    longitude: d.longitude,
    tags: d.tags,
    bestTimeToVisit: d.bestTimeToVisit,
  },
});

export const eventToRow = (e: Event, position: number, regions: Region[]): EventRow => ({
  ...base(e.id, e.name, position),
  ...published,
  slug: e.slug,
  region_id: regionIdFor(regions, e.region),
  category: e.category,
  location: e.location,
  start_date: e.startDate,
  end_date: e.endDate,
  is_free: e.isFree,
  ticket_price: e.ticketPrice ?? null,
  short_description: e.shortDescription,
  description: e.description,
  image_url: e.imageUrl,
  featured: e.featured,
  details: {
    venue: e.venue,
    activities: e.activities,
    transportInfo: e.transportInfo,
    relatedDestinations: e.relatedDestinations,
    tags: e.tags,
    website: e.website,
  },
});

export const festivalToRow = (f: Festival, position: number, regions: Region[]): FestivalRow => ({
  ...base(f.id, f.name, position),
  ...published,
  region_id: regionIdFor(regions, f.region),
  category: f.category,
  town: f.town,
  ethnic_group: f.ethnicGroup,
  month: f.month,
  description: f.description,
  image_url: f.image,
  completeness: f.completeness,
  featured: false,
  details: {
    alternateNames: f.alternateNames,
    otherRegions: f.otherRegions,
    traditionalArea: f.traditionalArea,
    usualDate: f.usualDate,
    duration: f.duration,
    historicalSignificance: f.historicalSignificance,
    culturalSignificance: f.culturalSignificance,
    activities: f.activities,
    attractionsNearby: f.attractionsNearby,
    imageCredit: f.imageCredit,
    sources: f.sources,
    notes: f.notes,
  },
});

export const transportToRow = (t: Transportation, position: number): TransportRow => ({
  ...base(t.id, t.name, position),
  ...published,
  type: t.type,
  description: t.description,
  image_url: t.imageUrl,
  details: {
    providers: t.providers ?? [],
    routes: t.routes,
    safetyTips: t.safetyTips,
    pros: t.pros,
    cons: t.cons,
    bookingInfo: t.bookingInfo,
  },
});

// ─── Row → entity (what the public site renders) ──────────────────────────────

const list = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);
const text = (value: unknown): string => (typeof value === 'string' ? value : '');
const optionalText = (value: unknown): string | undefined => (typeof value === 'string' && value ? value : undefined);
const optionalNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

export const rowToRegion = (row: RegionRow, destinationCount: number): Region => ({
  id: row.id,
  name: row.name,
  code: row.code,
  capital: row.capital,
  description: row.description,
  imageUrl: row.image_url,
  color: row.color,
  destinationCount,
});

type RegionLookup = Pick<RegionRow, 'id' | 'name' | 'code'>[];
const regionOf = (regions: RegionLookup, id: string) =>
  regions.find((r) => r.id === id) ?? { id, name: id, code: '' };

export const rowToDestination = (row: DestinationRow, regions: RegionLookup): Destination => {
  const region = regionOf(regions, row.region_id);
  const d = row.details ?? {};
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    region: region.name,
    regionCode: region.code,
    type: row.type,
    description: row.description,
    shortDescription: row.short_description,
    imageUrl: row.image_url,
    imageCredit: optionalText(d.imageCredit),
    gallery: list(d.gallery),
    // Postgres numerics arrive as strings
    rating: Number(row.rating),
    reviewCount: Number(row.review_count),
    activities: list(d.activities),
    thingsToDo: list(d.thingsToDo),
    estimatedCostPerPerson: Number(row.estimated_cost),
    openingHours: optionalText(d.openingHours),
    entryFee: optionalNumber(d.entryFee),
    safetyInfo: optionalText(d.safetyInfo),
    transportOptions: list(d.transportOptions),
    nearbyDestinations: list(d.nearbyDestinations),
    latitude: optionalNumber(d.latitude),
    longitude: optionalNumber(d.longitude),
    featured: row.featured,
    tags: list(d.tags),
    bestTimeToVisit: optionalText(d.bestTimeToVisit),
  };
};

export const rowToEvent = (row: EventRow, regions: RegionLookup): Event => {
  const region = regionOf(regions, row.region_id);
  const d = row.details ?? {};
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    description: row.description,
    shortDescription: row.short_description,
    imageUrl: row.image_url,
    startDate: row.start_date,
    endDate: row.end_date,
    location: row.location,
    region: region.name,
    regionCode: region.code,
    venue: optionalText(d.venue),
    isFree: row.is_free,
    ticketPrice: row.ticket_price === null ? undefined : Number(row.ticket_price),
    activities: list(d.activities),
    transportInfo: optionalText(d.transportInfo),
    relatedDestinations: list(d.relatedDestinations),
    featured: row.featured,
    tags: list(d.tags),
    website: optionalText(d.website),
  };
};

export const rowToFestival = (row: FestivalRow, regions: RegionLookup): Festival => {
  const d = row.details ?? {};
  return {
    id: row.id,
    name: row.name,
    alternateNames: list(d.alternateNames),
    region: regionOf(regions, row.region_id).name,
    otherRegions: list(d.otherRegions),
    traditionalArea: text(d.traditionalArea),
    town: row.town,
    ethnicGroup: row.ethnic_group,
    category: row.category,
    month: row.month,
    usualDate: text(d.usualDate),
    duration: text(d.duration),
    description: row.description,
    historicalSignificance: text(d.historicalSignificance),
    culturalSignificance: text(d.culturalSignificance),
    activities: list(d.activities),
    attractionsNearby: list(d.attractionsNearby),
    image: row.image_url,
    imageCredit: text(d.imageCredit),
    sources: list(d.sources),
    completeness: row.completeness,
    notes: text(d.notes),
  };
};

export const rowToTransport = (row: TransportRow): Transportation => {
  const d = row.details ?? {};
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    providers: list(d.providers),
    routes: list(d.routes),
    safetyTips: list(d.safetyTips),
    pros: list(d.pros),
    cons: list(d.cons),
    bookingInfo: optionalText(d.bookingInfo),
  };
};

/** URL-safe id from a name: "Cape Coast Castle" → "cape-coast-castle". */
export const slugify = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ɛ/gi, 'e')
    .replace(/ɔ/gi, 'o')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
