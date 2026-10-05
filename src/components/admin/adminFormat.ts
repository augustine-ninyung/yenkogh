// Formatting and option lists shared by the admin screens.

export const formatAdminDate = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  const date = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatAdminDateTime = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/** "greater-accra" → "Greater Accra", "transport_options" → "Transport options". */
export const labelFromId = (id: string): string =>
  id
    .split(/[-_]/)
    .map((word, i) => (i === 0 || id.includes('-') ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');

type Option = { value: string; label: string };
const options = (values: Record<string, string>): Option[] =>
  Object.entries(values).map(([value, label]) => ({ value, label }));

export const DESTINATION_TYPE_OPTIONS = options({
  beach: 'Beach',
  'national-park': 'National park',
  historical: 'Historical',
  waterfall: 'Waterfall',
  cultural: 'Cultural',
  city: 'City',
  lake: 'Lake',
  wildlife: 'Wildlife',
  botanical: 'Botanical garden',
  religious: 'Religious site',
});

export const EVENT_CATEGORY_OPTIONS = options({
  festival: 'Festival',
  traditional: 'Traditional',
  cultural: 'Cultural',
  music: 'Music',
  food: 'Food',
  sports: 'Sports',
  art: 'Art',
  religious: 'Religious',
});

export const FESTIVAL_CATEGORY_OPTIONS = options({
  harvest: 'Harvest',
  migration: 'Migration',
  purification: 'Purification',
  ancestral: 'Ancestral',
  'war-commemoration': 'War commemoration',
  initiation: 'Initiation',
  religious: 'Religious',
  fire: 'Fire',
  fishing: 'Fishing',
  hunting: 'Hunting',
  heritage: 'Heritage',
  arts: 'Arts',
  development: 'Development',
});

export const COMPLETENESS_OPTIONS = options({
  detailed: 'Detailed',
  basic: 'Basic',
  'name-only': 'Name only',
});

export const TRANSPORT_TYPE_OPTIONS = options({
  bus: 'Bus',
  trotro: 'Trotro',
  taxi: 'Taxi',
  'shared-taxi': 'Shared taxi',
  'ride-hailing': 'Ride-hailing',
  train: 'Train',
  'domestic-flight': 'Domestic flight',
  boat: 'Ferry / boat',
  'private-vehicle': 'Private car',
});

export const optionLabel = (list: Option[], value: unknown): string =>
  list.find((o) => o.value === value)?.label ?? String(value ?? '');
