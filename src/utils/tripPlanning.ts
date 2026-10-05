import type { BudgetItem, Festival, Itinerary, ItineraryItem, TripAccommodation } from '@/types';
import { destinations } from '@/data/destinations';
import { festivals, getEventIdForFestival, getFestivalMonths, MONTH_NAMES } from '@/data/festivals';
import { getEventById } from '@/data/events';
import { accommodations } from '@/data/accommodations';
import { regions } from '@/data/regions';

export const toIsoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const fromIso = (iso: string) => new Date(`${iso}T00:00:00`);

export const addDays = (iso: string, days: number) => {
  const d = fromIso(iso);
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
};

const longDate = (iso: string) =>
  fromIso(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/**
 * Region and town for an itinerary stop. A stop may be a listed destination, a
 * festival, a region or its capital, a town we know a place to stay in, or any
 * place the traveller typed in themselves (which resolves to no region).
 */
export const resolveStop = (stop: string): { region: string; town: string } => {
  const name = stop.trim().toLowerCase();
  const destination = destinations.find((d) => d.name.toLowerCase() === name);
  if (destination) return { region: destination.region, town: destination.name };
  const festival = festivals.find((f) => f.name.toLowerCase() === name);
  if (festival) return { region: festival.region, town: festival.town };
  const region = regions.find((r) => r.name.toLowerCase() === name || r.capital.toLowerCase() === name);
  if (region) return { region: region.name, town: region.capital };
  const stayTown = accommodations.find((a) => a.town.toLowerCase() === name);
  if (stayTown) return { region: stayTown.region, town: stayTown.town };
  const festivalTown = festivals.find((f) => f.town.toLowerCase() === name);
  if (festivalTown) return { region: festivalTown.region, town: festivalTown.town };
  return { region: '', town: stop.trim() };
};

// ─── Festival dates ───────────────────────────────────────────────────────────

/**
 * When a festival can be attended: the exact dates of this year's scheduled
 * event if it is still ahead, otherwise the calendar months it usually falls in.
 * Null for festivals with no fixed month (lunar or recurring calendars).
 */
export type FestivalWindow =
  | { kind: 'dates'; startDate: string; endDate: string; label: string }
  | { kind: 'months'; months: number[]; label: string };

export const getFestivalWindow = (festival: Festival, today = new Date()): FestivalWindow | null => {
  const eventId = getEventIdForFestival(festival.id);
  const event = eventId ? getEventById(eventId) : undefined;
  if (event && fromIso(event.endDate) >= today) {
    const label =
      event.startDate === event.endDate
        ? longDate(event.startDate)
        : `${longDate(event.startDate)} to ${longDate(event.endDate)}`;
    return { kind: 'dates', startDate: event.startDate, endDate: event.endDate, label };
  }
  const months = getFestivalMonths(festival);
  if (months.length === 0) return null;
  return { kind: 'months', months, label: festival.usualDate || festival.month };
};

/**
 * Checks chosen trip dates against the festival. Returns a message when the
 * trip would miss it, or null when the dates fit or cannot be checked.
 */
export const getFestivalDateConflict = (
  festival: Festival,
  startDate: string,
  endDate: string,
  today = new Date(),
): string | null => {
  if (!startDate || !endDate || endDate < startDate) return null;
  const window = getFestivalWindow(festival, today);
  if (!window) return null;

  if (window.kind === 'dates') {
    const overlaps = startDate <= window.endDate && endDate >= window.startDate;
    return overlaps ? null : `The ${festival.name} runs ${window.label}. Your dates fall outside it, so you would miss the festival.`;
  }

  // Month window: the trip must include at least one day in a festival month
  for (let day = startDate, n = 0; day <= endDate && n < 370; day = addDays(day, 1), n++) {
    if (window.months.includes(fromIso(day).getMonth())) return null;
  }
  const monthNames = window.months.map((m) => MONTH_NAMES[m]);
  const when = monthNames.length > 1 ? `${monthNames.slice(0, -1).join(', ')} or ${monthNames[monthNames.length - 1]}` : monthNames[0];
  return `The ${festival.name} is held in ${when} (${window.label}). Your dates fall outside that, so you would miss the festival.`;
};

/** A start date inside the festival's next window, for a "move my dates" shortcut. */
export const getNextFestivalStart = (festival: Festival, today = new Date()): string | null => {
  const window = getFestivalWindow(festival, today);
  if (!window) return null;
  if (window.kind === 'dates') return window.startDate > toIsoDate(today) ? window.startDate : toIsoDate(today);
  // The current month still counts if the festival month has not ended
  const month = window.months.includes(today.getMonth())
    ? today.getMonth()
    : (window.months.find((m) => m > today.getMonth()) ?? window.months[0]);
  if (month === today.getMonth()) return toIsoDate(today);
  const year = today.getFullYear() + (month < today.getMonth() ? 1 : 0);
  return toIsoDate(new Date(year, month, 1));
};

// ─── Itinerary ────────────────────────────────────────────────────────────────

/** Adds an "attend the festival" entry on the day spent at the festival stop. */
export const addFestivalToItinerary = (itinerary: Itinerary, festival: Festival): Itinerary => {
  const atFestival = itinerary.days.filter((d) => d.location === festival.name);
  // Prefer the second day there, so it does not land on the arrival day
  const target = atFestival[1] ?? atFestival[0] ?? itinerary.days[Math.min(1, itinerary.days.length - 1)];
  if (!target || target.items.some((i) => i.id === `festival-${festival.id}`)) return itinerary;

  const item: ItineraryItem = {
    id: `festival-${festival.id}`,
    time: '10:00',
    title: `Attend the ${festival.name}`,
    description:
      festival.activities.length > 0
        ? `Highlights: ${festival.activities.slice(0, 3).join('; ')}.`
        : festival.description,
    type: 'activity',
    cost: 0,
    location: festival.town || festival.region,
  };

  return {
    ...itinerary,
    days: itinerary.days.map((d) =>
      d === target
        ? { ...d, items: [...d.items, item].sort((a, b) => (a.time ?? '').localeCompare(b.time ?? '')) }
        : d,
    ),
  };
};

/** Stops of an itinerary in order, with the nights spent at each. */
export const getItineraryStops = (itinerary: Itinerary): { stop: string; nights: number }[] => {
  const stops: { stop: string; nights: number }[] = [];
  for (const day of itinerary.days) {
    const existing = stops.find((s) => s.stop === day.location);
    if (existing) existing.nights += 1;
    else stops.push({ stop: day.location, nights: 1 });
  }
  // The final day is the departure, so it needs no night's stay
  const last = stops[stops.length - 1];
  if (last && itinerary.days.length > 1) last.nights -= 1;
  return stops.filter((s) => s.nights > 0);
};

export const roomsFor = (travelers: number) => Math.max(1, Math.ceil(travelers / 2));

// ─── Costs and budget ─────────────────────────────────────────────────────────

export interface TripCosts {
  /** Activities, meals and transport from the itinerary */
  itinerary: number;
  stays: number;
  /** Costs the traveller added themselves */
  extras: number;
  total: number;
}

const sumItems = (itinerary: Itinerary, type: ItineraryItem['type']) =>
  itinerary.days
    .flatMap((d) => d.items)
    .filter((i) => i.type === type)
    .reduce((sum, i) => sum + (i.cost ?? 0), 0);

/**
 * Cost of a plan. Once the traveller picks their own stays, those replace the
 * itinerary's built-in accommodation line so lodging is not counted twice.
 */
export const getTripCosts = (
  itinerary: Itinerary,
  stays: TripAccommodation[],
  travelers: number,
  extras: BudgetItem[] = [],
): TripCosts => {
  const stayCost = stays.reduce((sum, s) => sum + s.nights * s.rooms * s.pricePerNight, 0);
  const builtInLodging = sumItems(itinerary, 'accommodation') * travelers;
  const itineraryCost =
    stays.length > 0 ? Math.max(0, itinerary.totalEstimatedCost - builtInLodging) : itinerary.totalEstimatedCost;
  const extrasCost = extras.reduce((sum, e) => sum + e.amount, 0);
  return { itinerary: itineraryCost, stays: stayCost, extras: extrasCost, total: itineraryCost + stayCost + extrasCost };
};

/** Budget lines that come from the plan itself carry this id prefix; the traveller's own lines do not. */
export const PLAN_ITEM_PREFIX = 'plan-';

export const isPlanItem = (item: BudgetItem) => item.id.startsWith(PLAN_ITEM_PREFIX);

/**
 * The plan's costs as budget lines: one per kind of itinerary cost, and one per
 * chosen stay. These are regenerated from the plan every time it is saved.
 */
export const buildPlanBudgetItems = (
  itinerary: Itinerary,
  stays: TripAccommodation[],
  travelers: number,
): BudgetItem[] => {
  const lines: BudgetItem[] = [
    { id: `${PLAN_ITEM_PREFIX}transport`, name: 'Transport (itinerary estimate)', amount: sumItems(itinerary, 'transport') * travelers, category: 'transportation' },
    { id: `${PLAN_ITEM_PREFIX}food`, name: 'Meals (itinerary estimate)', amount: sumItems(itinerary, 'meal') * travelers, category: 'food' },
    { id: `${PLAN_ITEM_PREFIX}activities`, name: 'Activities (itinerary estimate)', amount: sumItems(itinerary, 'activity') * travelers, category: 'activities' },
  ];
  if (stays.length === 0) {
    lines.push({ id: `${PLAN_ITEM_PREFIX}lodging`, name: 'Accommodation (itinerary estimate)', amount: sumItems(itinerary, 'accommodation') * travelers, category: 'accommodation' });
  }
  for (const s of stays) {
    lines.push({
      id: `${PLAN_ITEM_PREFIX}stay-${s.accommodationId}-${s.stop}`,
      name: `${s.name}, ${s.town} (${s.nights} ${s.nights === 1 ? 'night' : 'nights'}, ${s.rooms} ${s.rooms === 1 ? 'room' : 'rooms'})`,
      amount: s.nights * s.rooms * s.pricePerNight,
      category: 'accommodation',
    });
  }
  return lines.filter((l) => l.amount > 0);
};
