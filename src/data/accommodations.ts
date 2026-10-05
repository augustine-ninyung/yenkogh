import type { Accommodation, AccommodationTier, AccommodationType } from '@/types';

// Places to stay, by town and region.
//
// These are well-known properties listed as suggestions only: the app has no
// live availability or rates. Prices shown to travellers come from
// TIER_PRICE_PER_NIGHT, an indicative figure for the tier, not from the property.
// Regions with no named property here still get the generic options below.

/** Indicative nightly price per room, in GHS, for each tier. */
export const TIER_PRICE_PER_NIGHT: Record<AccommodationTier, number> = {
  budget: 200,
  'mid-range': 450,
  luxury: 1200,
};

const stay = (
  name: string,
  town: string,
  region: string,
  type: AccommodationType,
  tier: AccommodationTier,
): Accommodation => ({
  id: `${name}-${town}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  name,
  town,
  region,
  type,
  tier,
});

export const accommodations: Accommodation[] = [
  // Greater Accra
  stay('Labadi Beach Hotel', 'Accra', 'Greater Accra', 'hotel', 'luxury'),
  stay('Kempinski Hotel Gold Coast City', 'Accra', 'Greater Accra', 'hotel', 'luxury'),
  stay('Mövenpick Ambassador Hotel', 'Accra', 'Greater Accra', 'hotel', 'luxury'),
  stay('Alisa Hotel North Ridge', 'Accra', 'Greater Accra', 'hotel', 'mid-range'),
  stay('Somewhere Nice Hostel', 'Accra', 'Greater Accra', 'hostel', 'budget'),
  stay('Aqua Safari Resort', 'Ada', 'Greater Accra', 'resort', 'luxury'),

  // Central
  stay('Ridge Royal Hotel', 'Cape Coast', 'Central', 'hotel', 'luxury'),
  stay('Oasis Beach Resort', 'Cape Coast', 'Central', 'resort', 'budget'),
  stay('Coconut Grove Beach Resort', 'Elmina', 'Central', 'resort', 'mid-range'),
  stay('Elmina Beach Resort', 'Elmina', 'Central', 'resort', 'mid-range'),
  stay('Anomabo Beach Resort', 'Anomabo', 'Central', 'resort', 'mid-range'),

  // Western
  stay('Best Western Plus Atlantic Hotel', 'Takoradi', 'Western', 'hotel', 'luxury'),
  stay('Busua Beach Resort', 'Busua', 'Western', 'resort', 'mid-range'),
  stay('Lou Moon Lodge', 'Axim', 'Western', 'lodge', 'luxury'),
  stay('Axim Beach Resort', 'Axim', 'Western', 'resort', 'mid-range'),

  // Eastern
  stay('The Royal Senchi', 'Akosombo', 'Eastern', 'resort', 'luxury'),
  stay('Volta Hotel', 'Akosombo', 'Eastern', 'hotel', 'mid-range'),
  stay('Hillburi', 'Aburi', 'Eastern', 'resort', 'mid-range'),
  stay('Capital View Hotel', 'Koforidua', 'Eastern', 'hotel', 'mid-range'),
  stay('Rock City Hotel', 'Kwahu', 'Eastern', 'hotel', 'luxury'),

  // Ashanti
  stay('Golden Tulip Kumasi City', 'Kumasi', 'Ashanti', 'hotel', 'luxury'),
  stay('Lancaster Kumasi City', 'Kumasi', 'Ashanti', 'hotel', 'luxury'),
  stay('Golden Bean Hotel', 'Kumasi', 'Ashanti', 'hotel', 'mid-range'),
  stay('Four Villages Inn', 'Kumasi', 'Ashanti', 'guesthouse', 'mid-range'),

  // Volta
  stay('Volta Serene Hotel', 'Ho', 'Volta', 'hotel', 'luxury'),
  stay('Chances Hotel', 'Ho', 'Volta', 'hotel', 'mid-range'),
  stay('Sky Plus Hotel', 'Ho', 'Volta', 'hotel', 'mid-range'),
  stay('Aborigines Beach Resort', 'Keta', 'Volta', 'resort', 'mid-range'),
  stay('Meet Me There African Home Lodge', 'Dzita', 'Volta', 'lodge', 'budget'),
  stay('Wli Water Heights Hotel', 'Wli', 'Volta', 'hotel', 'budget'),

  // Northern
  stay('Radach Lodge', 'Tamale', 'Northern', 'lodge', 'mid-range'),
  stay('Modern City Hotel', 'Tamale', 'Northern', 'hotel', 'mid-range'),

  // Savannah
  stay('Zaina Lodge', 'Mole National Park', 'Savannah', 'lodge', 'luxury'),
  stay('Mole Motel', 'Mole National Park', 'Savannah', 'hotel', 'mid-range'),

  // Upper East
  stay('Ex-Tee Crystal Hotel', 'Bolgatanga', 'Upper East', 'hotel', 'mid-range'),
  stay('Akayet Hotel', 'Bolgatanga', 'Upper East', 'hotel', 'mid-range'),

  // Upper West
  stay('Upland Hotel', 'Wa', 'Upper West', 'hotel', 'mid-range'),
  stay('Nuoyong Empire Hotel', 'Wa', 'Upper West', 'hotel', 'mid-range'),

  // Bono
  stay('Eusbett Hotel', 'Sunyani', 'Bono', 'hotel', 'mid-range'),
  stay('Tyco City Hotel', 'Sunyani', 'Bono', 'hotel', 'mid-range'),

  // Bono East
  stay('Encom Hotel', 'Techiman', 'Bono East', 'hotel', 'mid-range'),
];

// Typical options offered everywhere, so every stop has something to choose from
const GENERIC_OPTIONS: { label: string; type: AccommodationType; tier: AccommodationTier }[] = [
  { label: 'Local guesthouse', type: 'guesthouse', tier: 'budget' },
  { label: 'Serviced apartment', type: 'apartment', tier: 'mid-range' },
];

/**
 * Places to stay for a stop: named properties in the same town first, then the
 * rest of the region, then the generic guesthouse and apartment options.
 */
export const getStayOptions = (region: string, town = ''): Accommodation[] => {
  const townLower = town.toLowerCase();
  const inTown = (a: Accommodation) => Boolean(townLower) && townLower.includes(a.town.toLowerCase());
  const named = accommodations
    .filter((a) => a.region === region)
    .sort((a, b) => Number(inTown(b)) - Number(inTown(a)));

  const place = town || (region ? `${region} Region` : 'the area');
  const generic = GENERIC_OPTIONS.map(
    (g): Accommodation => ({
      id: `generic-${g.type}-${(region || 'ghana').toLowerCase().replace(/\s+/g, '-')}`,
      name: g.label,
      town: place,
      region,
      type: g.type,
      tier: g.tier,
      generic: true,
    }),
  );

  return [...named, ...generic];
};
