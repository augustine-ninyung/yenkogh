import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Bus, Brain, Wallet, Shield, Globe, Clock, ArrowRight, Pause, Play } from 'lucide-react';
import { cn } from '@/utils/cn';
import { DestinationCard } from '@/components/cards/DestinationCard';
import { EventCard } from '@/components/cards/EventCard';
import { TransportCard } from '@/components/cards/TransportCard';
import { DestinationCardSkeleton } from '@/components/ui/Skeleton';
import { useFeaturedDestinations } from '@/hooks/useDestinations';
import { useFeaturedEvents } from '@/hooks/useEvents';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { regions } from '@/data/regions';
import { transportation } from '@/data/transportation';
import { destinations } from '@/data/destinations';
import { festivals } from '@/data/festivals';

const HERO_LOCATIONS = [
  { name: 'Cape Coast', position: 'top-[23%] left-[53%]' },
  { name: 'Kumasi', position: 'top-[51%] right-[18%]' },
  { name: 'Accra', position: 'top-[73%] left-[20%]' },
];

const FEATURES = [
  {
    icon: Compass,
    title: 'Discover Ghana',
    description: 'Explore curated destinations across Ghana — from historical castles to waterfalls and wildlife sanctuaries.',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950',
  },
  {
    icon: Brain,
    title: 'AI Trip Planner',
    description: 'Tell us your dates, budget, and interests and our AI will draft a day-by-day Ghana itinerary for you to review.',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950',
  },
  {
    icon: Bus,
    title: 'Transportation Guide',
    description: 'Navigate Ghana with confidence. Understand bus routes, trotros, taxis, domestic flights, and ferry services across the country.',
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-950',
  },
  {
    icon: Wallet,
    title: 'Budget Planner',
    description: 'Plan every cedi. Set a budget, track spending across categories, and estimate what your Ghana trip will cost.',
    color: 'text-[#FFD300]',
    bg: 'bg-yellow-50 dark:bg-yellow-950',
  },
];

const DESTINATIONS_PREVIEW = [
  { name: 'Cape Coast', region: 'Central', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Cape_Coast_Castle%2C_Cape_Coast%2C_Ghana.JPG?width=400', slug: 'cape-coast-castle', type: 'Historical' },
  { name: 'Kakum NP', region: 'Central', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Canopy_walkway_in_Kakum_National_Park_3.jpg?width=400', slug: 'kakum-national-park', type: 'National Park' },
  { name: 'Mole NP', region: 'Savannah', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mole_National_Park%2C_West_Gonja_(P1100448).jpg?width=400', slug: 'mole-national-park', type: 'Wildlife' },
  { name: 'Wli Falls', region: 'Volta', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Wli_Lower_Fall-4.jpg?width=400', slug: 'wli-waterfalls', type: 'Waterfall' },
  { name: 'Labadi Beach', region: 'Greater Accra', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/La-Beach_(Labadi_Accra).jpg?width=400', slug: 'labadi-beach', type: 'Beach' },
  { name: 'Manhyia Palace', region: 'Ashanti', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Manhyia_Palace_Museum_(Kumasi%2C_Ghana_2017).jpg?width=400', slug: 'manhyia-palace', type: 'Cultural' },
];

// Hero background slideshow (Unsplash photos, served straight from their CDN)
const HERO_SLIDES = [
  { id: '1727023663921-967d01f69c7e', page: '9ieZ4ooO4-4', caption: 'Black Star Gate, Accra', credit: 'Nana Kwandoh', position: 'center 25%' },
  { id: '1562490654-131366a15276', page: 'Y5biRJCR-Q4', caption: 'Rainforest canopy walkway', credit: 'orva studio', position: 'center' },
  { id: '1636783186375-b8bb268df9c0', page: 'eBEi9TFRGY8', caption: 'Fishing boats on the coast', credit: 'The Artboard', position: 'center' },
  { id: '1543838215-403d7bf6e149', page: 'R3IYAFLDX0I', caption: 'Elephant in the wild', credit: 'Julianna Corbett', position: 'center' },
  { id: '1742476126735-cba186771cf2', page: '9VfgaIH_mJM', caption: 'Independence Square, Accra', credit: 'WyteShot', position: 'center 60%' },
];
const HERO_SLIDE_MS = 6500; // time each photo stays up
const HERO_FADE_MS = 1600; // cross-fade between photos
const HERO_ZOOM_MS = HERO_SLIDE_MS + HERO_FADE_MS; // zoom keeps moving through the fade-out

const heroImageUrl = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1920&q=75`;

export default function LandingPage() {
  const { destinations: featured, isLoading: destLoading } = useFeaturedDestinations();
  const { events: featuredEvents } = useFeaturedEvents();

  const [activeSlide, setActiveSlide] = useState(0);
  const [zoomReady, setZoomReady] = useState(false);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  // Moving content must be pausable (WCAG 2.2.2); reduced-motion users start paused
  const [pausedByUser, setPausedByUser] = useState<boolean | null>(null);
  const paused = pausedByUser ?? reducedMotion;
  const zoomEnabled = zoomReady && !paused;

  // Start the first slide's zoom one frame after mount so it animates instead of starting zoomed
  useEffect(() => {
    const frame = requestAnimationFrame(() => setZoomReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Advance automatically and loop; restarting on activeSlide gives a manual pick its full time
  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(
      () => setActiveSlide((i) => (i + 1) % HERO_SLIDES.length),
      HERO_SLIDE_MS,
    );
    return () => clearTimeout(timer);
  }, [activeSlide, paused]);

  return (
    <div className="min-h-screen">
      {/* ─── Hero Section ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#090C11]">
        {/* Background slideshow: slides cross-fade while the active one slowly zooms in */}
        {HERO_SLIDES.map((slide, i) => {
          const isActive = i === activeSlide;
          return (
            <div
              key={slide.id}
              aria-hidden="true"
              className="absolute inset-0 bg-cover bg-no-repeat will-change-[opacity,transform]"
              style={{
                backgroundImage: `url(${heroImageUrl(slide.id)})`,
                backgroundPosition: slide.position,
                opacity: isActive ? 1 : 0,
                transform: isActive && zoomEnabled ? 'scale(1.1)' : 'scale(1)',
                // An outgoing slide holds its zoom until it has fully faded, then resets unseen
                transition: isActive
                  ? `opacity ${HERO_FADE_MS}ms ease-in-out, transform ${HERO_ZOOM_MS}ms linear`
                  : `opacity ${HERO_FADE_MS}ms ease-in-out, transform 0s linear ${HERO_FADE_MS}ms`,
              }}
            />
          );
        })}
        {/* Overlays: even dim for text contrast, darker towards the left and bottom edges */}
        <div className="absolute inset-0 bg-[#090C11]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090C11]/60 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090C11]/60 via-transparent to-[#090C11]/20" />

        {/* Floating location chips */}
        {HERO_LOCATIONS.map((loc) => (
          <span
            key={loc.name}
            className={cn(
              'hidden lg:inline-flex absolute z-10 items-center gap-2 rounded-full bg-[#090C11]/60 backdrop-blur-sm border border-white/10 px-3.5 py-1.5 text-xs font-semibold text-white',
              loc.position,
            )}
          >
            <span className="w-2 h-2 rounded-full bg-[#FFD300]" />
            {loc.name}
          </span>
        ))}

        {/* Content */}
        <div className="relative z-10 w-full max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-16 text-white">
          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-7 sm:whitespace-nowrap">
            Discover Ghana.<br />
            Your Way.
          </h1>

          <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-9">
            Find places to visit, festivals to catch and how to get there, then plan your trip day by day.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center gap-4 mb-14">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2.5 bg-[#FFD300] hover:bg-yellow-400 text-[#090C11] font-bold px-7 py-3.5 rounded-full transition-all duration-200 shadow-lg shadow-[#FFD300]/20"
            >
              Explore Ghana
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/planner"
              className="inline-flex items-center bg-white/5 hover:bg-white/15 text-white font-bold px-7 py-3.5 rounded-full border border-white/50 transition-all duration-200 backdrop-blur-sm"
            >
              Plan a Trip
            </Link>
          </div>

          {/* Stats, counted from the content actually on the site */}
          <div className="flex flex-wrap gap-x-10 gap-y-6">
            {[
              { label: 'Regions covered', value: String(regions.length) },
              { label: 'Destinations', value: String(destinations.length) },
              { label: 'Festivals documented', value: String(festivals.length) },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-extrabold">{s.value}</p>
                <p className="text-sm text-white/75 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPausedByUser(!paused)}
            aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
            className="mr-1 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD300]"
          >
            {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          </button>
          {HERO_SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActiveSlide(i)}
              aria-label={`Show photo ${i + 1}: ${slide.caption}`}
              aria-current={i === activeSlide}
              className={cn(
                'h-1.5 rounded-full transition-all duration-500',
                i === activeSlide ? 'w-8 bg-[#FFD300]' : 'w-3 bg-white/40 hover:bg-white/70',
              )}
            />
          ))}
        </div>

        {/* Caption and photo credit for the current slide */}
        <a
          href={`https://unsplash.com/photos/${HERO_SLIDES[activeSlide].page}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:block absolute bottom-5 right-5 z-10 text-right text-xs text-white/60 hover:text-white/90 transition-colors"
        >
          <span className="block font-semibold text-white/85">{HERO_SLIDES[activeSlide].caption}</span>
          Photo by {HERO_SLIDES[activeSlide].credit} on Unsplash
        </a>
      </section>

      {/* ─── Popular Destinations ─────────────────────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-[#090C11]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#090C11] dark:text-white">
                Popular destinations
              </h2>
              <p className="text-muted mt-2 max-w-xl">
                Castles, national parks, waterfalls and beaches across Ghana.
              </p>
            </div>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 text-accent-ink font-semibold hover:gap-3 transition-all duration-200 flex-shrink-0"
            >
              View all destinations <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {destLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <DestinationCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(featured.length > 0 ? featured : DESTINATIONS_PREVIEW.slice(0, 6).map(d => ({
                id: d.slug, name: d.name, slug: d.slug, region: d.region, regionCode: d.region,
                type: 'cultural' as const, description: '', shortDescription: '',
                imageUrl: d.img, gallery: [], rating: 0, reviewCount: 0,
                activities: [], thingsToDo: [], estimatedCostPerPerson: 200, transportOptions: [],
                nearbyDestinations: [], featured: true, tags: [],
              }))).slice(0, 6).map((dest) => (
                <DestinationCard key={dest.id} destination={dest} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Upcoming Events ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50 dark:bg-[#262B32]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#090C11] dark:text-white">
                Upcoming events
              </h2>
              <p className="text-muted mt-2 max-w-xl">
                Festivals, food and arts events coming up around the country.
              </p>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-accent-ink font-semibold hover:gap-3 transition-all duration-200 flex-shrink-0"
            >
              All events <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(featuredEvents.length > 0 ? featuredEvents : []).slice(0, 3).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Explore by Region ────────────────────────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-[#090C11]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#090C11] dark:text-white mb-3">
              Explore by region
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              Browse places to visit in each of Ghana's 16 regions.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {regions.slice(0, 8).map((region) => (
              <Link
                key={region.id}
                to={`/explore?region=${region.code}`}
                className="group relative overflow-hidden rounded-2xl aspect-square"
              >
                <img
                  src={region.imageUrl}
                  alt={region.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090C11]/80 via-[#090C11]/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-semibold text-sm">{region.name}</p>
                  <p className="text-white/70 text-xs">
                    {region.destinationCount === 0 ? 'Coming soon' : `${region.destinationCount} ${region.destinationCount === 1 ? 'place' : 'places'}`}
                  </p>
                </div>
                <div className={cn('absolute top-3 right-3 w-3 h-3 rounded-full', region.color)} />
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 border border-[#FFD300] text-accent-ink hover:bg-[#FFD300] hover:text-[#090C11] font-semibold px-8 py-4 rounded-xl transition-all duration-200"
            >
              Explore all regions <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Transportation Preview ───────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50 dark:bg-[#262B32]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#090C11] dark:text-white">
                Getting around
              </h2>
              <p className="text-muted mt-2 max-w-xl">
                How buses, trotros, taxis and domestic flights work, with typical fares.
              </p>
            </div>
            <Link
              to="/transportation"
              className="inline-flex items-center gap-2 text-accent-ink font-semibold hover:gap-3 transition-all duration-200 flex-shrink-0"
            >
              Full guide <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {transportation.slice(0, 3).map((t) => (
              <TransportCard key={t.id} transport={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why YɛnkɔGH ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-[#090C11]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#090C11] dark:text-white mb-3">
              What you can do here
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              Find places, plan a route and keep a budget for your trip.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={cn('rounded-2xl p-6 border border-transparent hover:border-[#FFD300]/20 transition-all duration-200', f.bg)}
              >
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-white dark:bg-[#090C11]/50')}>
                  <f.icon className={cn('w-6 h-6', f.color)} />
                </div>
                <h3 className="font-semibold text-[#262B32] dark:text-white text-lg mb-2">{f.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>

          {/* Additional trust signals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
            {[
              { icon: Shield, title: 'Safety Tips', desc: 'Practical safety advice for getting around, gathered from public sources.' },
              { icon: Clock, title: 'Check Before You Go', desc: 'Prices, fees and schedules are estimates. Confirm with operators before you travel.' },
              { icon: Globe, title: 'Ghana-First', desc: 'Built specifically for travel within Ghana, with prices in Ghana Cedis.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-6 rounded-2xl border border-gray-100 dark:border-white/10">
                <div className="w-10 h-10 rounded-xl bg-[#FFD300]/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-[#FFD300]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#262B32] dark:text-white mb-1">{item.title}</h4>
                  <p className="text-muted text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#262B32] dark:bg-[#090C11] relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD300] rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFD300] rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
            Plan your trip
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10">
            Create a free account to plan trips, save places and keep a budget for each journey across Ghana.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-[#FFD300] hover:bg-yellow-400 text-[#090C11] font-bold px-10 py-5 rounded-xl text-lg transition-all duration-200 shadow-xl shadow-[#FFD300]/30"
            >
              Start Planning, It's Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-10 py-5 rounded-xl border border-white/20 text-lg transition-all duration-200"
            >
              <Compass className="w-5 h-5" />
              Explore First
            </Link>
          </div>

          <p className="text-white/70 text-sm mt-8">
            No credit card required · Prices in Ghana Cedi (₵)
          </p>
        </div>
      </section>
    </div>
  );
}
