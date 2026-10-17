import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  MapPin,
  Compass,
  CheckCircle2,
  Bookmark,
  RefreshCw,
  PartyPopper,
  BedDouble,
  Download,
  Bus,
  MessageSquare,
  Search,
  X,
  Info,
  Plus,
  Trash2,
  Wallet,
  AlertTriangle,
  Database,
} from 'lucide-react';
import { aiPlannerService, MAX_PROMPT_LENGTH, MAX_TRIP_DAYS } from '@/services/aiPlannerService';
import type { PlanResult } from '@/services/aiPlannerService';
import { tripService } from '@/services/tripService';
import { budgetService } from '@/services/budgetService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { destinations } from '@/data/destinations';
import { festivals, getFestivalById } from '@/data/festivals';
import { regions } from '@/data/regions';
import { getStayOptions, TIER_PRICE_PER_NIGHT } from '@/data/accommodations';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
  addDays,
  addFestivalToItinerary,
  buildPlanBudgetItems,
  getFestivalDateConflict,
  getFestivalWindow,
  getItineraryStops,
  getNextFestivalStart,
  getTripCosts,
  isPlanItem,
  resolveStop,
  roomsFor,
  toIsoDate,
} from '@/utils/tripPlanning';
import { downloadTripPdf } from '@/utils/tripDownload';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/utils/cn';
import type {
  Accommodation,
  BudgetCategoryKey,
  BudgetItem,
  Itinerary,
  TransportType,
  TripAccommodation,
} from '@/types';

const INTERESTS_OPTIONS = [
  'Historical Castles & Slavery Heritage',
  'Canopy Walks & Rainforest Hiking',
  'Wildlife Safaris & Elephants',
  'Traditional Festivals & Royal Durbars',
  'Beaches & Coastal Relaxation',
  'Local Food (Waakye, Jollof, Fufu)',
  'Art, Kente Cloth & Craft Markets',
  'Waterfalls & Lake Cruising',
];

const TRANSPORT_OPTIONS: { value: TransportType; label: string }[] = [
  { value: 'bus', label: 'Intercity bus' },
  { value: 'trotro', label: 'Trotro' },
  { value: 'taxi', label: 'Taxi' },
  { value: 'ride-hailing', label: 'Ride-hailing' },
  { value: 'private-vehicle', label: 'Private car' },
  { value: 'domestic-flight', label: 'Domestic flight' },
];

const FESTIVAL_INTEREST = 'Traditional Festivals & Royal Durbars';

const PROMPT_EXAMPLES = [
  '3 days from Accra to Cape Coast for two people with GHS 1500. We love history and beaches.',
  'A weekend of waterfalls and hiking in the Volta Region, solo, budget 900 cedis.',
  'Five days in the north to see elephants, 4 people, GHS 8000.',
];

const EXTRA_CATEGORIES: { value: BudgetCategoryKey; label: string }[] = [
  { value: 'transportation', label: 'Transport' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'food', label: 'Food & drinks' },
  { value: 'activities', label: 'Activities' },
  { value: 'entranceFees', label: 'Entrance fees' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'miscellaneous', label: 'Other' },
];

const cardClass =
  'p-6 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm space-y-4';
const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11] text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD300]';
const labelClass = 'text-xs font-semibold text-muted block mb-1.5 uppercase';

export const AIPlannerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { addToast } = useToast();

  const prefillDest = searchParams.get('destination');
  const prefillFestival = getFestivalById(searchParams.get('festival') || '');
  const tripIdParam = searchParams.get('tripId');
  const todayIso = toIsoDate(new Date());

  // Form State
  const [festivalId, setFestivalId] = useState(prefillFestival?.id ?? '');
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(
    prefillFestival ? [] : prefillDest ? [prefillDest] : ['Cape Coast Castle', 'Kakum National Park']
  );
  const [destinationSearch, setDestinationSearch] = useState('');
  // A festival trip starts with no dates, so the traveller picks them against the festival's window
  const [startDate, setStartDate] = useState(prefillFestival ? '' : addDays(todayIso, 14));
  const [endDate, setEndDate] = useState(prefillFestival ? '' : addDays(todayIso, 17));
  const [customPlace, setCustomPlace] = useState('');
  const [numberOfTravelers, setNumberOfTravelers] = useState(2);
  const [budget, setBudget] = useState(2500);
  const [interests, setInterests] = useState<string[]>(
    prefillFestival
      ? [FESTIVAL_INTEREST, 'Local Food (Waakye, Jollof, Fufu)']
      : ['Historical Castles & Slavery Heritage', 'Local Food (Waakye, Jollof, Fufu)']
  );
  const [accommodationType, setAccommodationType] = useState<'budget' | 'mid-range' | 'luxury'>('mid-range');
  const [transport, setTransport] = useState<TransportType[]>(['bus', 'taxi']);
  const [specialRequests, setSpecialRequests] = useState('');
  // The trip in the traveller's own words; an alternative to filling in the steps
  const [tripPrompt, setTripPrompt] = useState('');
  // Costs the traveller adds themselves; saved as lines on the trip's budget
  const [extras, setExtras] = useState<BudgetItem[]>([]);
  const [extraName, setExtraName] = useState('');
  const [extraAmount, setExtraAmount] = useState('');
  const [extraCategory, setExtraCategory] = useState<BudgetCategoryKey>('miscellaneous');

  // Planner Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<Itinerary | null>(null);
  const [step, setStep] = useState<'form' | 'itinerary'>(tripIdParam ? 'itinerary' : 'form');
  const [stays, setStays] = useState<TripAccommodation[]>([]);
  const [savedTripId, setSavedTripId] = useState<string | null>(null);
  const [isLoadingTrip, setIsLoadingTrip] = useState(Boolean(tripIdParam));
  const [isDownloading, setIsDownloading] = useState(false);
  // False until a saved trip's budget has been read, so it is never overwritten with defaults
  const [budgetLoaded, setBudgetLoaded] = useState(false);
  const [showMissPrompt, setShowMissPrompt] = useState(false);
  // How the plan on screen was produced; empty for a trip opened from My Trips
  const [planInfo, setPlanInfo] = useState<PlanResult | null>(null);

  const festival = getFestivalById(festivalId);
  const festivalWindow = festival ? getFestivalWindow(festival) : null;
  const dateConflict = festival ? getFestivalDateConflict(festival, startDate, endDate) : null;
  const nextFestivalStart = festival ? getNextFestivalStart(festival) : null;

  // Shifts the trip into the festival's window, keeping its length
  const moveDatesToFestival = () => {
    if (!nextFestivalStart) return;
    const length =
      startDate && endDate && endDate >= startDate
        ? Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)
        : 3;
    setStartDate(nextFestivalStart);
    setEndDate(addDays(nextFestivalStart, length));
    setShowMissPrompt(false);
  };

  // Open a saved trip from My Trips
  useEffect(() => {
    if (!tripIdParam || isAuthLoading) return;
    let cancelled = false;
    tripService.getById(tripIdParam).then((trip) => {
      if (cancelled) return;
      if (trip && trip.itinerary && trip.userId === user?.id) {
        setSavedTripId(trip.id);
        setStep('itinerary');
        setGeneratedItinerary(trip.itinerary);
        setStays(trip.accommodations ?? []);
        setFestivalId(trip.festivalId ?? '');
        const festivalName = getFestivalById(trip.festivalId ?? '')?.name;
        setSelectedDestinations(trip.destinations.filter((d) => d !== festivalName));
        setStartDate(trip.startDate);
        setEndDate(trip.endDate);
        setNumberOfTravelers(trip.numberOfTravelers);
        budgetService.getByTripId(trip.id).then((linked) => {
          if (cancelled) return;
          if (linked) {
            setBudget(linked.totalBudget);
            setExtras(linked.items.filter((i) => !isPlanItem(i)));
          }
          setBudgetLoaded(true);
        });
      } else {
        setStep('form');
      }
      setIsLoadingTrip(false);
    });
    return () => {
      cancelled = true;
    };
  }, [tripIdParam, user?.id, isAuthLoading]);

  // A saved trip keeps its budget in step with every change made here
  useEffect(() => {
    if (!savedTripId || !user || !generatedItinerary || !budgetLoaded) return;
    const timer = setTimeout(() => {
      budgetService.syncForTrip(user.id, {
        tripId: savedTripId,
        name: `${generatedItinerary.title} budget`,
        totalBudget: budget,
        items: [...buildPlanBudgetItems(generatedItinerary, stays, numberOfTravelers), ...extras],
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [savedTripId, user, generatedItinerary, budgetLoaded, budget, stays, extras, numberOfTravelers]);

  const addExtra = () => {
    const amount = parseFloat(extraAmount);
    if (!extraName.trim() || isNaN(amount) || amount <= 0) return;
    setExtras((prev) => [
      ...prev,
      { id: `custom-${Date.now()}`, name: extraName.trim(), amount, category: extraCategory },
    ]);
    setExtraName('');
    setExtraAmount('');
  };

  const addCustomPlace = () => {
    const place = customPlace.trim();
    if (!place) return;
    if (!selectedDestinations.some((d) => d.toLowerCase() === place.toLowerCase())) {
      setSelectedDestinations((prev) => [...prev, place]);
    }
    setCustomPlace('');
  };

  const toggleInterest = (item: string) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleTransport = (value: TransportType) => {
    setTransport((prev) => (prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]));
  };

  const addDestination = (name: string) => {
    if (name && !selectedDestinations.includes(name)) {
      setSelectedDestinations([...selectedDestinations, name]);
    }
  };

  const removeDestination = (name: string) => {
    setSelectedDestinations(selectedDestinations.filter((d) => d !== name));
  };

  const handleFestivalChange = (id: string) => {
    setFestivalId(id);
    const next = getFestivalById(id);
    if (next && !interests.includes(FESTIVAL_INTEREST)) setInterests((prev) => [FESTIVAL_INTEREST, ...prev]);
  };

  // Suggestions: places in the festival's region first, narrowed by the search box
  const destinationSuggestions = useMemo(() => {
    const q = destinationSearch.trim().toLowerCase();
    const festivalRegions = festival ? [festival.region, ...festival.otherRegions] : [];
    const matches = destinations
      .filter((d) => !selectedDestinations.includes(d.name))
      .filter((d) => !q || d.name.toLowerCase().includes(q) || d.region.toLowerCase().includes(q))
      .sort((a, b) => Number(festivalRegions.includes(b.region)) - Number(festivalRegions.includes(a.region)));
    return q ? matches : matches.slice(0, 8);
  }, [destinationSearch, selectedDestinations, festival]);

  // The festival is a stop in its own right, ahead of the other destinations
  const tripStops = festival ? [festival.name, ...selectedDestinations] : selectedDestinations;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tripStops.length === 0) {
      addToast({
        variant: 'warning',
        title: 'Destination Required',
        message: 'Please choose at least one destination or festival in Ghana.',
      });
      return;
    }
    if (endDate < startDate) {
      addToast({
        variant: 'warning',
        title: 'Check Your Dates',
        message: 'The end date must be on or after the start date.',
      });
      return;
    }

    const tripDays = Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000);
    if (tripDays > MAX_TRIP_DAYS) {
      addToast({
        variant: 'warning',
        title: 'Trip Too Long',
        message: `Trips can be planned for 1 to ${MAX_TRIP_DAYS} days. Yours is ${tripDays} days.`,
      });
      return;
    }

    if (dateConflict) {
      setShowMissPrompt(true);
      return;
    }
    await generate();
  };

  const handleDescribe = async () => {
    if (tripPrompt.trim().length < 10) {
      addToast({
        variant: 'warning',
        title: 'Tell Us a Little More',
        message: 'Describe the trip in a sentence: where, how long, how many people and your budget.',
      });
      return;
    }
    await generate(true);
  };

  // fromDescription: plan from the traveller's sentence, using the form only for what it leaves out
  const generate = async (fromDescription = false) => {
    setShowMissPrompt(false);
    setIsGenerating(true);
    setStep('itinerary');

    try {
      const result = await aiPlannerService.plan(
        fromDescription
          ? {
              prompt: tripPrompt.trim(),
              startDate,
              endDate,
              numberOfTravelers,
              budget,
              accommodationType,
              transportPreference: transport,
            }
          : {
              destinations: selectedDestinations,
              festivalId: festival?.id,
              startDate,
              endDate,
              numberOfTravelers,
              budget,
              interests,
              transportPreference: transport,
              accommodationType,
              specialRequests: specialRequests.trim(),
            },
      );

      // Show what the planner understood, so saving and the budget use the same figures
      const planFestival = getFestivalById(result.applied.festivalId ?? '');
      if (fromDescription) {
        setFestivalId(planFestival?.id ?? '');
        setSelectedDestinations(result.applied.destinations);
      }
      setStartDate(result.applied.startDate);
      setEndDate(result.applied.endDate);
      setNumberOfTravelers(result.applied.numberOfTravelers);
      setBudget(result.applied.budget);
      setGeneratedItinerary(planFestival ? addFestivalToItinerary(result.itinerary, planFestival) : result.itinerary);
      setPlanInfo(result);
      // Stops may have changed, so earlier stay choices no longer apply
      setStays([]);
      addToast({
        variant: 'success',
        title: 'Itinerary Ready!',
        message:
          result.source === 'ai'
            ? 'Your plan was written from the YɛnkɔGH catalogue.'
            : 'Your plan was put together from the YɛnkɔGH catalogue.',
      });
    } catch (err) {
      addToast({
        variant: 'error',
        title: 'Could Not Plan This Trip',
        message: (err instanceof Error && err.message) || 'Could not generate itinerary. Please try again.',
      });
      setStep('form');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!isAuthenticated || !user) {
      addToast({
        variant: 'info',
        title: 'Account Required',
        message: 'Please log in to save this trip to your dashboard.',
      });
      navigate('/login');
      return;
    }

    if (!generatedItinerary) return;

    try {
      const details = {
        userId: user.id,
        name: generatedItinerary.title,
        destinations: tripStops,
        startDate,
        endDate,
        numberOfTravelers,
        status: 'planning' as const,
        itinerary: generatedItinerary,
        festivalId: festival?.id,
        accommodations: stays,
      };
      const saved = savedTripId
        ? await tripService.update(savedTripId, details)
        : await tripService.create(user.id, details);
      const linked = await budgetService.syncForTrip(user.id, {
        tripId: saved.id,
        name: `${saved.name} budget`,
        totalBudget: budget,
        items: [...buildPlanBudgetItems(generatedItinerary, stays, numberOfTravelers), ...extras],
      });
      if (saved.budgetId !== linked.id) await tripService.update(saved.id, { budgetId: linked.id });

      addToast({
        variant: 'success',
        title: savedTripId ? 'Trip Updated!' : 'Trip Saved!',
        message: 'Your itinerary is in My Trips and its costs are on the Budget page.',
      });
      navigate('/dashboard/trips');
    } catch {
      addToast({
        variant: 'error',
        title: 'Save Failed',
        message: 'Could not save trip. Please try again.',
      });
    }
  };

  const handleDownload = async () => {
    if (!generatedItinerary) return;
    setIsDownloading(true);
    try {
      await downloadTripPdf({
        title: generatedItinerary.title,
        startDate,
        endDate,
        numberOfTravelers,
        destinations: tripStops,
        itinerary: generatedItinerary,
        stays,
        festival,
        budget,
        extras,
      });
    } catch (err) {
      console.error(err);
      addToast({
        variant: 'error',
        title: 'Download Failed',
        message: 'Could not create the PDF. Please try again.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const rooms = roomsFor(numberOfTravelers);
  const stops = generatedItinerary ? getItineraryStops(generatedItinerary) : [];
  const costs = generatedItinerary ? getTripCosts(generatedItinerary, stays, numberOfTravelers, extras) : null;

  // One stay per stop: choosing another replaces it, choosing the same one removes it
  const toggleStay = (stop: string, nights: number, option: Accommodation) => {
    setStays((prev) => {
      const current = prev.find((s) => s.stop === stop);
      const others = prev.filter((s) => s.stop !== stop);
      if (current?.accommodationId === option.id) return others;
      return [
        ...others,
        {
          accommodationId: option.id,
          name: option.name,
          town: option.town,
          type: option.type,
          stop,
          nights,
          rooms,
          pricePerNight: TIER_PRICE_PER_NIGHT[option.tier],
        },
      ];
    });
  };

  const extrasEditor = (
    <div className="space-y-3">
      {extras.length > 0 && (
        <ul className="divide-y divide-gray-100 dark:divide-white/5">
          {extras.map((item) => (
            <li key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="font-semibold truncate">{item.name}</p>
                <span className="text-xs text-muted">
                  {EXTRA_CATEGORIES.find((c) => c.value === item.category)?.label}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-bold">{formatCurrency(item.amount)}</span>
                <button
                  type="button"
                  onClick={() => setExtras((prev) => prev.filter((e) => e.id !== item.id))}
                  aria-label={`Remove ${item.name}`}
                  className="text-muted hover:text-red-500 p-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <input
          type="text"
          value={extraName}
          onChange={(e) => setExtraName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addExtra();
            }
          }}
          placeholder="What is it? (flight, car hire, souvenirs...)"
          aria-label="Cost name"
          className={cn(inputClass, 'sm:col-span-5')}
        />
        <input
          type="number"
          min={0}
          value={extraAmount}
          onChange={(e) => setExtraAmount(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addExtra();
            }
          }}
          placeholder="Amount (GH₵)"
          aria-label="Cost amount in cedis"
          className={cn(inputClass, 'sm:col-span-3')}
        />
        <select
          value={extraCategory}
          onChange={(e) => setExtraCategory(e.target.value as BudgetCategoryKey)}
          aria-label="Cost category"
          className={cn(inputClass, 'sm:col-span-3')}
        >
          {EXTRA_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <Button type="button" variant="outline" onClick={addExtra} aria-label="Add cost" className="sm:col-span-1 px-0">
          <Plus size={16} />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="pt-24 pb-20 bg-gray-50 dark:bg-[#090C11] min-h-screen text-[#262B32] dark:text-white">
      {/* Header Banner */}
      <div className="bg-[#262B32] dark:bg-[#090C11] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <Badge variant="primary" className="mb-3">
            AI-Powered Travel Intelligence
          </Badge>
          <h1 className="font-['Playfair_Display',serif] text-3xl sm:text-5xl font-bold mb-3">
            Smart Ghana Trip Planner
          </h1>
          <p className="text-white/70 max-w-2xl text-sm sm:text-base">
            Tell us where you want to go and what you love. Our smart planner creates a balanced, cost-effective day-by-day travel plan across Ghana with local transport, cultural dining, and timing tips.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 'form' ? (
          /* Planning Input Wizard Form */
          <form onSubmit={handleGenerate} className="space-y-8">
            {/* Describe the trip in a sentence */}
            <div className={cn(cardClass, 'border-[#FFD300]/60 dark:border-[#FFD300]/40')}>
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles size={18} className="text-[#FFD300]" />
                  <label htmlFor="trip-prompt">Describe your trip</label>
                </h2>
                <p className="text-xs sm:text-sm text-muted mt-1">
                  Say it in your own words: how long, where from, where to, how many people and what you want to spend. Anything you leave out is taken from the steps below.
                </p>
              </div>
              <textarea
                id="trip-prompt"
                value={tripPrompt}
                onChange={(e) => setTripPrompt(e.target.value)}
                rows={3}
                maxLength={MAX_PROMPT_LENGTH}
                placeholder={PROMPT_EXAMPLES[0]}
                className={cn(inputClass, 'resize-y')}
              />
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs text-muted w-full">Try one of these:</span>
                {PROMPT_EXAMPLES.map((example) => (
                  <button
                    type="button"
                    key={example}
                    onClick={() => setTripPrompt(example)}
                    className="px-2.5 py-1 rounded-lg text-xs text-left border border-gray-200 dark:border-white/10 hover:border-[#FFD300] hover:bg-[#FFD300]/10 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-muted">
                  {tripPrompt.length} of {MAX_PROMPT_LENGTH} characters
                </span>
                <Button type="button" variant="primary" onClick={handleDescribe} className="font-bold">
                  <Sparkles size={16} />
                  <span>Plan this trip</span>
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold uppercase text-muted">
              <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
              <span>or build it step by step</span>
              <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
            </div>

            {/* Step 1: Festival */}
            <div className={cardClass}>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <PartyPopper size={18} className="text-[#FFD300]" />
                <span>1. Planning around a festival?</span>
                <span className="text-xs font-medium text-muted">Optional</span>
              </h2>

              {festival ? (
                <div className="rounded-2xl border border-[#FFD300]/50 bg-[#FFD300]/10 p-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link to={`/festivals/${festival.id}`} className="font-bold hover:underline">
                      {festival.name}
                    </Link>
                    <p className="text-xs sm:text-sm text-muted dark:text-white/70 mt-1">
                      {[festival.town, `${festival.region} Region`].filter(Boolean).join(' · ')}
                    </p>
                    <p className="text-xs sm:text-sm text-muted dark:text-white/70 mt-1">
                      Usually held: {festival.usualDate || festival.month || 'date not on record'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFestivalChange('')}
                    aria-label={`Remove ${festival.name} from this trip`}
                    className="shrink-0 p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-white/60 dark:hover:bg-white/10"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <select
                  value=""
                  onChange={(e) => handleFestivalChange(e.target.value)}
                  aria-label="Choose a festival to attend"
                  className={inputClass}
                >
                  <option value="">No festival: just plan the destinations below</option>
                  {regions.map((r) => {
                    const inRegion = festivals.filter((f) => f.region === r.name);
                    if (inRegion.length === 0) return null;
                    return (
                      <optgroup key={r.code} label={`${r.name} Region`}>
                        {inRegion.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                            {f.month ? ` (${f.month})` : ''}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              )}
            </div>

            {/* Step 2: Destinations */}
            <div className={cardClass}>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <MapPin size={18} className="text-[#FFD300]" />
                <span>2. {festival ? 'What else would you like to see?' : 'Where would you like to visit?'}</span>
              </h2>

              {/* Selected Pills */}
              <div className="flex flex-wrap gap-2">
                {festival && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#090C11] text-white dark:bg-white dark:text-[#090C11]">
                    <PartyPopper size={12} />
                    <span>{festival.name}</span>
                  </span>
                )}
                {selectedDestinations.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FFD300]/20 text-[#090C11] dark:text-[#FFD300]"
                  >
                    <span>{d}</span>
                    <button
                      type="button"
                      onClick={() => removeDestination(d)}
                      aria-label={`Remove ${d}`}
                      className="hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {tripStops.length === 0 && (
                  <span className="text-xs text-muted">Nothing selected yet. Add a place below.</span>
                )}
              </div>

              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
                <input
                  type="text"
                  value={destinationSearch}
                  onChange={(e) => setDestinationSearch(e.target.value)}
                  placeholder="Search all destinations by name or region..."
                  aria-label="Search destinations"
                  className={cn(inputClass, 'pl-10')}
                />
              </div>

              <div>
                <span className="text-xs text-muted block mb-2">
                  {destinationSearch
                    ? 'Matching destinations:'
                    : festival
                      ? `Suggestions, starting with the ${festival.region} Region:`
                      : 'Quick additions:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {destinationSuggestions.map((dest) => (
                    <button
                      type="button"
                      key={dest.id}
                      onClick={() => addDestination(dest.name)}
                      className="px-2.5 py-1 rounded-lg text-xs border border-gray-200 dark:border-white/10 hover:border-[#FFD300] hover:bg-[#FFD300]/10 transition-colors"
                    >
                      + {dest.name}
                      <span className="text-muted"> · {dest.region}</span>
                    </button>
                  ))}
                  {destinationSuggestions.length === 0 && (
                    <span className="text-xs text-muted">No destinations match that search.</span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-white/10">
                <span className="text-xs text-muted block mb-2">
                  Going somewhere not listed? Add any city, town or place:
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customPlace}
                    onChange={(e) => setCustomPlace(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomPlace();
                      }
                    }}
                    placeholder="e.g. Kumasi, Tamale, Osu, my grandmother's village"
                    aria-label="Add your own place"
                    className={inputClass}
                  />
                  <Button type="button" variant="outline" onClick={addCustomPlace} className="shrink-0 gap-1.5">
                    <Plus size={16} />
                    <span>Add place</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Step 3: Dates, Travelers & Budget */}
            <div className={cardClass}>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Calendar size={18} className="text-[#FFD300]" />
                <span>3. Dates, Travelers & Budget</span>
              </h2>

              {festival && (
                <div className="flex gap-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-3 text-xs sm:text-sm">
                  <Info size={16} className="shrink-0 mt-0.5 text-muted" />
                  <span>
                    {festivalWindow
                      ? <>The <strong>{festival.name}</strong> is held: <strong>{festivalWindow.label}</strong>. Pick dates that include it.</>
                      : <>The <strong>{festival.name}</strong> follows a traditional calendar with no fixed month, so we cannot check your dates against it. Find out when it is next held before choosing.</>}
                  </span>
                </div>
              )}
              {dateConflict && (
                <div role="alert" className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-red-300 bg-red-50 dark:bg-red-900/15 p-3 text-xs sm:text-sm text-red-800 dark:text-red-200">
                  <div className="flex gap-2.5 flex-1">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <span>{dateConflict}</span>
                  </div>
                  {nextFestivalStart && (
                    <Button type="button" variant="outline" size="sm" onClick={moveDatesToFestival} className="shrink-0">
                      Move my dates to the festival
                    </Button>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className={labelClass}>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    min={todayIso}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                    }}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || todayIso}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                    }}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Travelers</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={numberOfTravelers}
                    onChange={(e) => setNumberOfTravelers(parseInt(e.target.value) || 1)}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Target Budget (GH₵)</label>
                  <input
                    type="number"
                    min={100}
                    step={100}
                    value={budget}
                    onChange={(e) => setBudget(parseInt(e.target.value) || 500)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Interests & Travel Style */}
            <div className={cardClass}>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Compass size={18} className="text-[#FFD300]" />
                <span>4. Travel Style & Interests</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-muted block mb-2 uppercase">
                    What excites you in Ghana?
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {INTERESTS_OPTIONS.map((interest) => (
                      <button
                        type="button"
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`p-3 rounded-xl text-xs sm:text-sm font-medium border text-left flex items-center justify-between transition-all ${
                          interests.includes(interest)
                            ? 'bg-[#FFD300]/20 border-[#FFD300] text-[#090C11] dark:text-[#FFD300]'
                            : 'border-gray-200 dark:border-white/10 text-muted dark:text-white/80 hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                      >
                        <span>{interest}</span>
                        {interests.includes(interest) && (
                          <CheckCircle2 size={16} className="text-[#FFD300] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-muted block mb-2 uppercase">
                    Accommodation Tier
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {(['budget', 'mid-range', 'luxury'] as const).map((tier) => (
                      <button
                        type="button"
                        key={tier}
                        onClick={() => setAccommodationType(tier)}
                        className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold capitalize border text-center transition-all ${
                          accommodationType === tier
                            ? 'bg-[#FFD300] border-[#FFD300] text-[#090C11]'
                            : 'border-gray-200 dark:border-white/10 text-muted dark:text-white/80'
                        }`}
                      >
                        {tier}
                        <span className="block text-[10px] font-medium opacity-70 normal-case">
                          about {formatCurrency(TIER_PRICE_PER_NIGHT[tier])} a night
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted mt-2">
                    You can pick specific hotels and apartments for each stop once the itinerary is ready.
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-muted mb-2 uppercase flex items-center gap-1.5">
                    <Bus size={13} /> How do you want to get around?
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {TRANSPORT_OPTIONS.map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => toggleTransport(option.value)}
                        aria-pressed={transport.includes(option.value)}
                        className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all ${
                          transport.includes(option.value)
                            ? 'bg-[#FFD300]/20 border-[#FFD300] text-[#090C11] dark:text-[#FFD300]'
                            : 'border-gray-200 dark:border-white/10 text-muted dark:text-white/80 hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5: Own costs */}
            <div className={cardClass}>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Wallet size={18} className="text-[#FFD300]" />
                <span>5. Costs you already know about</span>
                <span className="text-xs font-medium text-muted">Optional</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted">
                Add anything you plan to spend on. Each line counts against your {formatCurrency(budget)} budget and is saved to this trip's budget.
              </p>
              {extrasEditor}
            </div>

            {/* Step 6: Special requests */}
            <div className={cardClass}>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <MessageSquare size={18} className="text-[#FFD300]" />
                <span>6. Anything else we should know?</span>
                <span className="text-xs font-medium text-muted">Optional</span>
              </h2>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Travelling with children, mobility needs, dietary requirements, a slower pace..."
                aria-label="Special requests"
                className={cn(inputClass, 'resize-y')}
              />
            </div>

            {/* Submit Button */}
            <div className="text-center pt-2">
              <Button type="submit" variant="primary" size="xl" className="px-12 font-bold shadow-xl">
                <Sparkles size={20} />
                <span>Generate Smart Ghana Itinerary</span>
              </Button>
              <p className="mt-4 text-xs text-muted max-w-md mx-auto">
                Your request is sent to Google's Gemini AI to write the plan, without your name or email. Please leave out personal details.
                AI plans can contain mistakes, so check them before you travel.{' '}
                <Link to="/privacy#share" className="underline underline-offset-2">Privacy Policy</Link>
              </p>
            </div>
          </form>
        ) : (
          /* Itinerary Result Display */
          <div className="space-y-8 animate-in fade-in duration-300">
            {isLoadingTrip ? (
              <div className="p-16 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 text-center space-y-4 shadow-xl">
                <Spinner size="lg" color="primary" />
                <h3 className="text-xl font-bold">Opening your trip...</h3>
              </div>
            ) : isGenerating ? (
              <div className="p-16 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 text-center space-y-4 shadow-xl">
                <Spinner size="lg" color="primary" />
                <h3 className="text-xl font-bold">Planning your trip...</h3>
                <p className="text-sm text-muted max-w-md mx-auto">
                  Looking up matching destinations, festivals, entry fees and transport fares in the YɛnkɔGH catalogue, then arranging them day by day.
                </p>
              </div>
            ) : generatedItinerary && costs ? (
              <div className="space-y-8">
                {/* Header Action Card */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-muted block mb-1">
                      {savedTripId ? 'Saved Trip' : 'Generated Itinerary'}
                    </span>
                    <h2 className="font-['Playfair_Display',serif] text-2xl sm:text-3xl font-bold">
                      {generatedItinerary.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted mt-1">
                      {generatedItinerary.days.length} Days · {numberOfTravelers}{' '}
                      {numberOfTravelers === 1 ? 'Traveler' : 'Travelers'} · Estimated Cost:{' '}
                      <span className="font-bold text-[#090C11] dark:text-[#FFD300]">
                        {formatCurrency(costs.total)}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStep('form')}
                      className="gap-1.5"
                    >
                      <RefreshCw size={14} />
                      <span>Adjust</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="gap-1.5"
                    >
                      <Download size={14} />
                      <span>{isDownloading ? 'Preparing...' : 'Download PDF'}</span>
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveTrip}
                      className="gap-1.5 font-bold"
                    >
                      <Bookmark size={14} />
                      <span>{savedTripId ? 'Update Trip' : 'Save to My Trips'}</span>
                    </Button>
                  </div>
                </div>

                {/* Festival + Cost Summary */}
                <div className={cn('grid grid-cols-1 gap-6', festival && 'lg:grid-cols-2')}>
                  {festival && (
                    <div className={cardClass}>
                      <h3 className="font-bold flex items-center gap-2">
                        <PartyPopper size={18} className="text-[#FFD300]" />
                        <span>Your festival</span>
                      </h3>
                      <div>
                        <Link to={`/festivals/${festival.id}`} className="font-bold text-lg hover:underline">
                          {festival.name}
                        </Link>
                        <p className="text-sm text-muted dark:text-white/70 mt-1">
                          {[festival.town, `${festival.region} Region`].filter(Boolean).join(' · ')}
                        </p>
                        <p className="text-sm text-muted dark:text-white/70 mt-1">
                          Usually held: {festival.usualDate || festival.month || 'date not on record'}
                        </p>
                      </div>
                      {dateConflict && (
                        <p role="alert" className="text-xs font-semibold text-red-700 dark:text-red-300">
                          {dateConflict} Use Adjust to change your dates.
                        </p>
                      )}
                    </div>
                  )}

                  <div className={cardClass}>
                    <h3 className="font-bold">Cost estimate</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted dark:text-white/70">Activities, meals and transport</dt>
                        <dd className="font-semibold">{formatCurrency(costs.itinerary)}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted dark:text-white/70">
                          Places to stay{stays.length === 0 && ' (none chosen yet)'}
                        </dt>
                        <dd className="font-semibold">{stays.length > 0 ? formatCurrency(costs.stays) : 'Included above'}</dd>
                      </div>
                      {extras.length > 0 && (
                        <div className="flex justify-between gap-4">
                          <dt className="text-muted dark:text-white/70">Your own costs ({extras.length})</dt>
                          <dd className="font-semibold">{formatCurrency(costs.extras)}</dd>
                        </div>
                      )}
                      <div className="flex justify-between gap-4 pt-2 border-t border-gray-100 dark:border-white/10 text-base">
                        <dt className="font-bold">Estimated total</dt>
                        <dd className="font-bold">{formatCurrency(costs.total)}</dd>
                      </div>
                    </dl>
                    <div>
                      <div className="h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', costs.total > budget ? 'bg-red-500' : 'bg-[#FFD300]')}
                          style={{ width: `${Math.min(100, (costs.total / budget) * 100)}%` }}
                        />
                      </div>
                      <p className={cn('text-xs mt-2', costs.total > budget ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-muted')}>
                        {costs.total > budget
                          ? `${formatCurrency(costs.total - budget)} over your ${formatCurrency(budget)} budget`
                          : `${formatCurrency(budget - costs.total)} under your ${formatCurrency(budget)} budget`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Where the plan's facts came from */}
                {planInfo && (
                  <div className={cardClass}>
                    <h3 className="font-bold flex items-center gap-2">
                      <Database size={18} className="text-[#FFD300]" />
                      <span>How this plan was built</span>
                    </h3>
                    <p className="text-sm text-muted dark:text-white/80">
                      {planInfo.source === 'ai'
                        ? 'Written by the AI planner, using only records from the YɛnkɔGH catalogue.'
                        : 'Put together directly from the YɛnkɔGH catalogue, without the AI planner.'}
                    </p>
                    {planInfo.notes.map((note) => (
                      <p key={note} className="text-sm">
                        {note}
                      </p>
                    ))}
                    <div className="flex flex-wrap gap-1.5">
                      {planInfo.grounding.destinations.map((d) => (
                        <Link
                          key={d.id}
                          to={`/explore/${d.id}`}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200 dark:border-white/10 hover:border-[#FFD300] hover:bg-[#FFD300]/10 transition-colors"
                        >
                          {d.name}
                        </Link>
                      ))}
                      {planInfo.grounding.festivals.map((f) => (
                        <Link
                          key={f.id}
                          to={`/festivals/${f.id}`}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200 dark:border-white/10 hover:border-[#FFD300] hover:bg-[#FFD300]/10 transition-colors"
                        >
                          {f.name}
                        </Link>
                      ))}
                      {planInfo.grounding.transport.map((t) => (
                        <span key={t.id} className="px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200 dark:border-white/10 text-muted dark:text-white/70">
                          {t.name}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-muted">
                      {planInfo.grounding.groundedItems} of {planInfo.grounding.activityItems} activities are tied to a catalogue record. Entry fees and fares come from the catalogue; meal and overnight prices are typical figures.
                    </p>
                  </div>
                )}

                {/* Day-by-Day Timeline */}
                <div className="space-y-6">
                  {generatedItinerary.days.map((day) => (
                    <div
                      key={day.day}
                      className={cardClass}
                    >
                      <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-[#FFD300] text-[#090C11] font-bold flex items-center justify-center text-sm">
                            D{day.day}
                          </span>
                          <div>
                            <h3 className="font-bold text-base sm:text-lg">{day.location}</h3>
                            <span className="text-xs text-muted">{day.description}</span>
                          </div>
                        </div>

                        {day.date && (
                          <span className="text-xs font-semibold text-muted">
                            {formatDate(day.date)}
                          </span>
                        )}
                      </div>

                      {/* Items inside day */}
                      <div className="space-y-3 pt-2">
                        {day.items.map((item) => (
                          <div
                            key={item.id}
                            className={cn(
                              'p-3.5 rounded-2xl border flex items-start justify-between gap-3 text-xs sm:text-sm',
                              item.id.startsWith('festival-')
                                ? 'bg-[#FFD300]/15 border-[#FFD300]/50'
                                : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5'
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <span className="font-mono text-xs font-bold text-accent-ink shrink-0 mt-0.5">
                                {item.time || '10:00'}
                              </span>
                              <div>
                                <h4 className="font-bold text-[#090C11] dark:text-white">
                                  {item.title}
                                </h4>
                                <p className="text-xs text-muted dark:text-white/70 mt-0.5">
                                  {item.description}
                                </p>
                              </div>
                            </div>

                            {item.cost !== undefined && item.cost > 0 && (
                              <span className="font-bold text-xs shrink-0 text-[#090C11] dark:text-[#FFD300]">
                                {formatCurrency(item.cost)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Where to stay */}
                {stops.length > 0 && (
                  <div className={cardClass}>
                    <div>
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <BedDouble size={18} className="text-[#FFD300]" />
                        <span>Where to stay</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-muted mt-1">
                        Optional. Add one place per stop and it is included in your cost estimate, saved trip and download. Prices are indicative for the tier, for {rooms} {rooms === 1 ? 'room' : 'rooms'}; nothing is booked.
                      </p>
                    </div>

                    {stops.map(({ stop, nights }) => {
                      const place = resolveStop(stop);
                      const options = getStayOptions(place.region, place.town);
                      const chosen = stays.find((s) => s.stop === stop);
                      return (
                        <div key={stop} className="pt-4 border-t border-gray-100 dark:border-white/10">
                          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                            <h4 className="font-bold">
                              {stop}
                              <span className="font-normal text-muted text-sm">
                                {' '}· {nights} {nights === 1 ? 'night' : 'nights'}
                                {place.region && ` · ${place.region} Region`}
                              </span>
                            </h4>
                            {chosen && (
                              <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                                Added: {chosen.name}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {options.map((option) => {
                              const isChosen = chosen?.accommodationId === option.id;
                              const price = TIER_PRICE_PER_NIGHT[option.tier];
                              return (
                                <div
                                  key={option.id}
                                  className={cn(
                                    'p-3.5 rounded-2xl border flex items-center justify-between gap-3',
                                    isChosen
                                      ? 'border-[#FFD300] bg-[#FFD300]/10'
                                      : 'border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5'
                                  )}
                                >
                                  <div className="min-w-0">
                                    <p className="font-semibold text-sm truncate">{option.name}</p>
                                    <p className="text-xs text-muted dark:text-white/60 capitalize truncate">
                                      {option.type} · <span className="normal-case">{option.town}</span>
                                    </p>
                                    <p className="text-xs mt-1">
                                      <span
                                        className={cn(
                                          'capitalize font-semibold',
                                          option.tier === accommodationType && 'text-green-700 dark:text-green-400'
                                        )}
                                      >
                                        {option.tier}
                                      </span>
                                      <span className="text-muted">
                                        {' '}· about {formatCurrency(price)} a night · {formatCurrency(price * nights * rooms)} total
                                      </span>
                                    </p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant={isChosen ? 'primary' : 'outline'}
                                    size="sm"
                                    onClick={() => toggleStay(stop, nights, option)}
                                    aria-pressed={isChosen}
                                    className="shrink-0"
                                  >
                                    {isChosen ? 'Remove' : 'Add'}
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Own costs */}
                <div className={cardClass}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <Wallet size={18} className="text-[#FFD300]" />
                        <span>Your own costs</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-muted mt-1">
                        {savedTripId
                          ? 'Anything you add here is saved to this trip\'s budget straight away.'
                          : 'Anything you add here goes into this trip\'s budget when you save the trip.'}
                      </p>
                    </div>
                    {savedTripId && (
                      <Link
                        to={`/budget?trip=${savedTripId}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold hover:text-[#FFD300] transition-colors shrink-0"
                      >
                        <Wallet size={14} /> Open this trip's budget
                      </Link>
                    )}
                  </div>
                  {extrasEditor}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Asked before generating when the chosen dates would miss the festival */}
      <Modal isOpen={showMissPrompt} onClose={() => setShowMissPrompt(false)} title="You would miss the festival" size="md">
        <div className="space-y-5">
          <p className="text-sm text-muted dark:text-white/80">{dateConflict}</p>
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2.5">
            <Button variant="outline" onClick={() => generate()}>
              Keep my dates anyway
            </Button>
            <Button variant="outline" onClick={() => setShowMissPrompt(false)}>
              Change dates myself
            </Button>
            {nextFestivalStart && (
              <Button variant="primary" onClick={moveDatesToFestival}>
                Move my dates to the festival
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AIPlannerPage;
