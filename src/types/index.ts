// ─── Destination types ────────────────────────────────────────────────────────

export type DestinationType =
  | 'beach'
  | 'national-park'
  | 'historical'
  | 'waterfall'
  | 'cultural'
  | 'city'
  | 'lake'
  | 'wildlife'
  | 'botanical'
  | 'religious';

export interface Activity {
  id: string;
  name: string;
  description: string;
  duration?: string;
  cost?: number;
}

export interface Gallery {
  id: string;
  url: string;
  alt: string;
  caption?: string;
}

export interface TransportOption {
  type: string;
  description: string;
  estimatedCost?: string;
  duration?: string;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  region: string;
  regionCode: string;
  type: DestinationType;
  description: string;
  shortDescription: string;
  imageUrl: string;
  /** Page carrying the photo's author and licence, when attribution is required */
  imageCredit?: string;
  gallery: Gallery[];
  rating: number;
  reviewCount: number;
  activities: Activity[];
  thingsToDo: string[];
  estimatedCostPerPerson: number;
  openingHours?: string;
  entryFee?: number;
  safetyInfo?: string;
  transportOptions: TransportOption[];
  nearbyDestinations: string[];
  latitude?: number;
  longitude?: number;
  featured: boolean;
  tags: string[];
  bestTimeToVisit?: string;
}

// ─── Region types ─────────────────────────────────────────────────────────────

export interface Region {
  id: string;
  name: string;
  code: string;
  capital: string;
  description: string;
  imageUrl: string;
  destinationCount: number;
  color: string;
}

// ─── Event types ──────────────────────────────────────────────────────────────

export type EventCategory =
  | 'festival'
  | 'cultural'
  | 'music'
  | 'food'
  | 'sports'
  | 'art'
  | 'religious'
  | 'traditional';

export interface Event {
  id: string;
  name: string;
  slug: string;
  category: EventCategory;
  description: string;
  shortDescription: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  location: string;
  region: string;
  regionCode: string;
  venue?: string;
  isFree: boolean;
  ticketPrice?: number;
  activities: string[];
  transportInfo?: string;
  relatedDestinations: string[];
  featured: boolean;
  tags: string[];
  website?: string;
}

// ─── Transportation types ─────────────────────────────────────────────────────

export type TransportType =
  | 'bus'
  | 'taxi'
  | 'ride-hailing'
  | 'train'
  | 'domestic-flight'
  | 'boat'
  | 'private-vehicle'
  | 'trotro'
  | 'shared-taxi';

export interface TransportRoute {
  from: string;
  to: string;
  estimatedDuration: string;
  estimatedCost: { min: number; max: number };
  frequency?: string;
  notes?: string;
}

/** A licensed tour guide listed on the site. Only verified guides are public. */
export interface TourGuide {
  id: string;
  name: string;
  region: string;
  bio: string;
  licenceNumber: string;
  verifiedOn: string;
  languages: string[];
  specialties: string[];
  phone?: string;
  email?: string;
}

export interface Transportation {
  id: string;
  type: TransportType;
  name: string;
  description: string;
  imageUrl: string;
  providers?: string[];
  routes: TransportRoute[];
  safetyTips: string[];
  pros: string[];
  cons: string[];
  bookingInfo?: string;
}

// ─── User types ───────────────────────────────────────────────────────────────

export type UserRole = 'user' | 'admin';

export type AccountStatus = 'active' | 'suspended';

export interface UserPreferences {
  currency: string;
  language: string;
  notifications: boolean;
  interests?: string[];
  preferredRegions?: string[];
  budgetRange?: 'budget' | 'mid-range' | 'luxury';
  travelStyle?: 'adventure' | 'cultural' | 'relaxation' | 'eco' | 'mixed';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** Suspended accounts cannot sign in or change anything. Absent means active. */
  status?: AccountStatus;
  avatar?: string;
  bio?: string;
  preferences: UserPreferences;
  createdAt: string;
  savedDestinations: string[];
  savedEvents: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

// ─── Trip / Itinerary types ───────────────────────────────────────────────────

export interface ItineraryItem {
  id: string;
  time?: string;
  title: string;
  description?: string;
  type: 'activity' | 'transport' | 'accommodation' | 'meal' | 'free-time';
  cost?: number;
  destinationId?: string;
  location?: string;
}

export interface ItineraryDay {
  day: number;
  date?: string;
  location: string;
  description?: string;
  items: ItineraryItem[];
}

export interface Itinerary {
  id: string;
  title: string;
  days: ItineraryDay[];
  totalEstimatedCost: number;
  generatedAt: string;
}

// ─── Accommodation types ──────────────────────────────────────────────────────

export type AccommodationTier = 'budget' | 'mid-range' | 'luxury';

export type AccommodationType = 'hotel' | 'resort' | 'lodge' | 'guesthouse' | 'hostel' | 'apartment';

export interface Accommodation {
  id: string;
  name: string;
  town: string;
  region: string;
  type: AccommodationType;
  tier: AccommodationTier;
  /** True for a typical option of this kind, not a named property */
  generic?: boolean;
}

/** A stay added to a trip: one place, for the nights spent at one stop. */
export interface TripAccommodation {
  accommodationId: string;
  name: string;
  town: string;
  type: AccommodationType;
  /** The itinerary stop this stay covers */
  stop: string;
  nights: number;
  rooms: number;
  /** Indicative nightly price per room in GHS, not a quoted rate */
  pricePerNight: number;
}

export interface Trip {
  id: string;
  userId: string;
  name: string;
  destinations: string[];
  startDate: string;
  endDate: string;
  numberOfTravelers: number;
  status: 'planning' | 'upcoming' | 'ongoing' | 'completed';
  itinerary?: Itinerary;
  /** Festival this trip is planned around, if any (id from data/festivals) */
  festivalId?: string;
  /** Places to stay the traveller added to the plan */
  accommodations?: TripAccommodation[];
  budgetId?: string;
  notes?: string;
  createdAt: string;
}

// ─── Budget types ─────────────────────────────────────────────────────────────

export type BudgetCategoryKey =
  | 'transportation'
  | 'accommodation'
  | 'food'
  | 'activities'
  | 'entranceFees'
  | 'shopping'
  | 'miscellaneous';

export interface BudgetItem {
  id: string;
  name: string;
  amount: number;
  category: BudgetCategoryKey;
  date?: string;
  notes?: string;
}

export interface BudgetCategory {
  key: BudgetCategoryKey;
  label: string;
  allocated: number;
  spent: number;
  color: string;
}

export interface Budget {
  id: string;
  userId: string;
  tripId?: string;
  name: string;
  totalBudget: number;
  currency: 'GHS';
  categories: BudgetCategory[];
  items: BudgetItem[];
  createdAt: string;
  updatedAt: string;
}

// ─── Search / Filter types ────────────────────────────────────────────────────

export interface SearchParams {
  query?: string;
  region?: string;
  type?: DestinationType;
  minRating?: number;
  maxCost?: number;
  minCost?: number;
  tags?: string[];
}

export interface EventFilterParams {
  query?: string;
  category?: EventCategory;
  region?: string;
  isFree?: boolean;
  startDate?: string;
  endDate?: string;
}

export type SortOption =
  | 'name-asc'
  | 'name-desc'
  | 'rating-desc'
  | 'cost-asc'
  | 'cost-desc'
  | 'newest';

// ─── AI Planner types ─────────────────────────────────────────────────────────

export interface PlannerInput {
  destinations: string[];
  startDate: string;
  endDate: string;
  numberOfTravelers: number;
  budget: number;
  interests: string[];
  transportPreference: TransportType[];
  accommodationType: 'budget' | 'mid-range' | 'luxury';
  specialRequests?: string;
  /** Festival the trip is built around; its name also appears in destinations as a stop */
  festival?: { name: string; town: string; usualDate: string };
}

// ─── Toast / Notification types ───────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// ─── Festival types ───────────────────────────────────────────────────────────

export type FestivalCategory =
  | 'harvest'
  | 'migration'
  | 'purification'
  | 'ancestral'
  | 'war-commemoration'
  | 'initiation'
  | 'religious'
  | 'fire'
  | 'fishing'
  | 'hunting'
  | 'heritage'
  | 'arts'
  | 'development';

/**
 * How much could be confirmed from published sources:
 * - detailed:  history, timing and activities are all documented
 * - basic:     place, people and timing are documented, little else
 * - name-only: a source confirms the festival exists, but gives no details
 */
export type FestivalCompleteness = 'detailed' | 'basic' | 'name-only';

export interface Festival {
  id: string;
  name: string;
  alternateNames: string[];
  region: string;
  /** Other regions where the same festival is also celebrated */
  otherRegions: string[];
  traditionalArea: string;
  town: string;
  ethnicGroup: string;
  category: FestivalCategory;
  month: string;
  usualDate: string;
  duration: string;
  description: string;
  historicalSignificance: string;
  culturalSignificance: string;
  activities: string[];
  attractionsNearby: string[];
  /** Empty when no verified, freely licensed photo of the festival was found */
  image: string;
  /** Page that carries the photo's author and licence (attribution is required) */
  imageCredit: string;
  sources: string[];
  completeness: FestivalCompleteness;
  /** Conflicts between sources, or anything a reader should double-check */
  notes: string;
}
