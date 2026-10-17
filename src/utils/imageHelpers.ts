/**
 * Curated mapping of Ghana destination/landmark names to Unsplash photo URLs.
 * All URLs include width and quality parameters for performance.
 */
export const GHANA_IMAGES: Record<string, string> = {
  // Destinations
  'cape coast':
    'https://images.unsplash.com/photo-1575986767340-5d17ae767ab0?w=800&q=80',
  'cape coast castle':
    'https://images.unsplash.com/photo-1575986767340-5d17ae767ab0?w=800&q=80',
  kakum:
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80',
  'kakum national park':
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80',
  mole: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80',
  'mole national park':
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80',
  elmina:
    'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&q=80',
  'elmina castle':
    'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&q=80',
  accra:
    'https://images.unsplash.com/photo-1589825743636-23a879d4b8e2?w=800&q=80',
  kumasi:
    'https://images.unsplash.com/photo-1565373677928-80cf5b789d2e?w=800&q=80',
  wli: 'https://images.unsplash.com/photo-1564419320461-6870880221ad?w=800&q=80',
  'wli waterfalls':
    'https://images.unsplash.com/photo-1564419320461-6870880221ad?w=800&q=80',
  'wli falls':
    'https://images.unsplash.com/photo-1564419320461-6870880221ad?w=800&q=80',
  aburi:
    'https://images.unsplash.com/photo-1598512752271-33f913a5af13?w=800&q=80',
  'aburi botanical gardens':
    'https://images.unsplash.com/photo-1598512752271-33f913a5af13?w=800&q=80',

  // Generic Ghana hero
  ghana:
    'https://images.unsplash.com/photo-1589825743636-23a879d4b8e2?w=1920&q=85',
  hero: 'https://images.unsplash.com/photo-1589825743636-23a879d4b8e2?w=1920&q=85',

  // Category fallbacks
  beach:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  'national-park':
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80',
  historical:
    'https://images.unsplash.com/photo-1575986767340-5d17ae767ab0?w=800&q=80',
  waterfall:
    'https://images.unsplash.com/photo-1564419320461-6870880221ad?w=800&q=80',
  cultural:
    'https://images.unsplash.com/photo-1565373677928-80cf5b789d2e?w=800&q=80',
  city: 'https://images.unsplash.com/photo-1589825743636-23a879d4b8e2?w=800&q=80',
  lake: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80',
  wildlife:
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80',
  botanical:
    'https://images.unsplash.com/photo-1598512752271-33f913a5af13?w=800&q=80',
  religious:
    'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&q=80',

  // Event category fallbacks
  festival:
    'https://images.unsplash.com/photo-1565373677928-80cf5b789d2e?w=800&q=80',
  music:
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80',
  food: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
  sports:
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80',
  art: 'https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=800&q=80',
  traditional:
    'https://images.unsplash.com/photo-1565373677928-80cf5b789d2e?w=800&q=80',
};

/** Default fallback when no matching key is found. */
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1589825743636-23a879d4b8e2?w=800&q=80';

/**
 * Normalise a lookup key to lowercase and trimmed for consistent matching.
 */
function normaliseKey(input: string): string {
  return input.toLowerCase().trim();
}

/**
 * Attempt to find an image URL by checking the lookup map against the full
 * normalised string and then each individual word within it.
 */
function resolveFromMap(input: string): string | undefined {
  const key = normaliseKey(input);
  if (GHANA_IMAGES[key]) return GHANA_IMAGES[key];

  // Try matching any word from the input against map keys
  const words = key.split(/\s+/);
  for (const word of words) {
    if (GHANA_IMAGES[word]) return GHANA_IMAGES[word];
  }

  return undefined;
}

/**
 * Return an Unsplash image URL for a Ghana destination by name.
 * Falls back to the generic Ghana hero image when no match is found.
 *
 * @example
 * getDestinationImageUrl("Cape Coast Castle")
 * // → "https://images.unsplash.com/photo-1575986767340-5d17ae767ab0?w=800&q=80"
 */
export function getDestinationImageUrl(destinationName: string): string {
  return resolveFromMap(destinationName) ?? DEFAULT_IMAGE;
}

/**
 * Return an Unsplash image URL for a Ghana event by name.
 * Falls back to the festival or generic Ghana image when no match is found.
 *
 * @example
 * getEventImageUrl("Chale Wote Street Art Festival")
 * // → art category image
 */
export function getEventImageUrl(eventName: string): string {
  const direct = resolveFromMap(eventName);
  if (direct) return direct;

  // Try matching event keywords to category fallbacks
  const lower = normaliseKey(eventName);
  const categoryKeywords: Array<[string, string]> = [
    ['festival', 'festival'],
    ['music', 'music'],
    ['food', 'food'],
    ['sport', 'sports'],
    ['art', 'art'],
    ['traditional', 'traditional'],
    ['cultural', 'cultural'],
    ['religious', 'religious'],
  ];

  for (const [keyword, category] of categoryKeywords) {
    if (lower.includes(keyword) && GHANA_IMAGES[category]) {
      return GHANA_IMAGES[category];
    }
  }

  return GHANA_IMAGES['festival'] ?? DEFAULT_IMAGE;
}

/**
 * Return a fallback Unsplash image URL for a given destination/event category.
 * Accepts DestinationType or EventCategory strings.
 *
 * @example
 * getFallbackImageUrl("beach")    // → beach image
 * getFallbackImageUrl("music")    // → music image
 * getFallbackImageUrl("unknown")  // → default Ghana image
 */
export function getFallbackImageUrl(category: string): string {
  const key = normaliseKey(category);
  return GHANA_IMAGES[key] ?? DEFAULT_IMAGE;
}

