import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, ChevronRight, Star, Compass, Bus, Brain, Wallet, Shield, Globe, Clock, ArrowRight, Play } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { DestinationCard } from '@/components/cards/DestinationCard';
import { EventCard } from '@/components/cards/EventCard';
import { TransportCard } from '@/components/cards/TransportCard';
import { DestinationCardSkeleton } from '@/components/ui/Skeleton';
import { useFeaturedDestinations } from '@/hooks/useDestinations';
import { useFeaturedEvents } from '@/hooks/useEvents';
import { regions } from '@/data/regions';
import { transportation } from '@/data/transportation';
import { formatCurrency } from '@/utils/formatters';

const STATS = [
  { label: 'Destinations', value: '50+', icon: MapPin },
  { label: 'Festivals', value: '30+', icon: Calendar },
  { label: 'Regions', value: '16', icon: Globe },
  { label: 'Happy Travelers', value: '10k+', icon: Star },
];

const FEATURES = [
  {
    icon: Compass,
    title: 'Discover Ghana',
    description: 'Explore over 50 curated destinations across all 16 regions — from historical castles to pristine waterfalls and wildlife sanctuaries.',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950',
  },
  {
    icon: Brain,
    title: 'AI Trip Planner',
    description: 'Tell us your dates, budget, and interests and our AI will generate a personalised day-by-day Ghana itinerary in seconds.',
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
    description: 'Plan every cedi. Set a budget, track spending across categories, and know exactly how much your Ghana trip will cost.',
    color: 'text-[#FFD300]',
    bg: 'bg-yellow-50 dark:bg-yellow-950',
  },
];

const DESTINATIONS_PREVIEW = [
  { name: 'Cape Coast', region: 'Central', img: 'https://images.unsplash.com/photo-1575986767340-5d17ae767ab0?w=400&q=80', slug: 'cape-coast-castle', type: 'Historical' },
  { name: 'Kakum NP', region: 'Central', img: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&q=80', slug: 'kakum-national-park', type: 'National Park' },
  { name: 'Mole NP', region: 'Savannah', img: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&q=80', slug: 'mole-national-park', type: 'Wildlife' },
  { name: 'Wli Falls', region: 'Volta', img: 'https://images.unsplash.com/photo-1564419320461-6870880221ad?w=400&q=80', slug: 'wli-waterfalls', type: 'Waterfall' },
  { name: 'Labadi Beach', region: 'Greater Accra', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80', slug: 'labadi-beach', type: 'Beach' },
  { name: 'Manhyia Palace', region: 'Ashanti', img: 'https://images.unsplash.com/photo-1565373677928-80cf5b789d2e?w=400&q=80', slug: 'manhyia-palace', type: 'Cultural' },
];

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { destinations: featured, isLoading: destLoading } = useFeaturedDestinations();
  const { events: featuredEvents, isLoading: eventsLoading } = useFeaturedEvents();

  const handleSearch = (q: string) => {
    if (q.trim()) navigate(`/explore?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="min-h-screen">
      {/* ─── Hero Section ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1589825743636-23a879d4b8e2?w=1920&q=85)' }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#090C11]/70 via-[#090C11]/60 to-[#090C11]/80" />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#FFD300] animate-pulse" />
            <span className="text-sm font-medium text-white/90">Ghana's #1 Tourism Platform</span>
          </div>

          {/* Headline */}
          <h1 className="font-['Playfair_Display',serif] text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Discover Ghana.<br />
            <span className="text-[#FFD300]">Plan Your Journey.</span><br />
            Yɛnkɔ.
          </h1>

          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Explore breathtaking destinations, vibrant festivals, and authentic experiences across all 16 regions of Ghana — from coastal castles to northern savannahs.
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <div className="flex gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2">
                <div className="flex-1 flex items-center gap-3 px-4">
                  <Search className="w-5 h-5 text-white/60 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search destinations, events, regions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                    className="flex-1 bg-transparent text-white placeholder:text-white/50 outline-none text-base"
                    aria-label="Search destinations"
                  />
                </div>
                <button
                  onClick={() => handleSearch(searchQuery)}
                  className="bg-[#FFD300] hover:bg-yellow-400 text-[#090C11] font-semibold px-6 py-3 rounded-xl transition-all duration-200 flex-shrink-0"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 bg-[#FFD300] hover:bg-yellow-400 text-[#090C11] font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-[#FFD300]/20"
            >
              <Compass className="w-5 h-5" />
              Explore Ghana
            </Link>
            <Link
              to="/planner"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl border border-white/30 transition-all duration-200 backdrop-blur-sm"
            >
              <Brain className="w-5 h-5" />
              Plan My Trip
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                <p className="text-2xl font-bold text-[#FFD300]">{s.value}</p>
                <p className="text-sm text-white/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-white/50 text-xs">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1">
            <div className="w-1 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* ─── Popular Destinations ─────────────────────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-[#090C11]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <Badge variant="primary" className="mb-3">Popular Destinations</Badge>
              <h2 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl font-bold text-[#262B32] dark:text-white">
                Discover Ghana's Finest
              </h2>
              <p className="text-[#757B81] mt-2 max-w-xl">
                From UNESCO heritage sites to pristine national parks — explore the destinations that define Ghana.
              </p>
            </div>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 text-[#FFD300] font-semibold hover:gap-3 transition-all duration-200 flex-shrink-0"
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
                imageUrl: d.img, gallery: [], rating: 4.5, reviewCount: 100,
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
              <Badge variant="warning" className="mb-3">Events & Festivals</Badge>
              <h2 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl font-bold text-[#262B32] dark:text-white">
                Upcoming Celebrations
              </h2>
              <p className="text-[#757B81] mt-2 max-w-xl">
                Immerse yourself in Ghana's vibrant festival calendar — from ancient harvest traditions to contemporary art festivals.
              </p>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-[#FFD300] font-semibold hover:gap-3 transition-all duration-200 flex-shrink-0"
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
            <Badge variant="info" className="mb-3">16 Regions</Badge>
            <h2 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl font-bold text-[#262B32] dark:text-white mb-3">
              Explore Ghana by Region
            </h2>
            <p className="text-[#757B81] max-w-xl mx-auto">
              Each of Ghana's 16 regions has its own unique character, culture, and attractions. Where will you go?
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
                  <p className="text-white/70 text-xs">{region.destinationCount} places</p>
                </div>
                <div className={cn('absolute top-3 right-3 w-3 h-3 rounded-full', region.color)} />
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 border border-[#FFD300] text-[#FFD300] hover:bg-[#FFD300] hover:text-[#090C11] font-semibold px-8 py-4 rounded-xl transition-all duration-200"
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
              <Badge variant="success" className="mb-3">Getting Around</Badge>
              <h2 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl font-bold text-[#262B32] dark:text-white">
                Travel Across Ghana
              </h2>
              <p className="text-[#757B81] mt-2 max-w-xl">
                From budget trotros to comfortable buses and domestic flights — understand your transport options.
              </p>
            </div>
            <Link
              to="/transportation"
              className="inline-flex items-center gap-2 text-[#FFD300] font-semibold hover:gap-3 transition-all duration-200 flex-shrink-0"
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
            <Badge variant="primary" className="mb-3">Why YɛnkɔGH?</Badge>
            <h2 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl font-bold text-[#262B32] dark:text-white mb-3">
              Your Complete Ghana Travel Companion
            </h2>
            <p className="text-[#757B81] max-w-2xl mx-auto">
              Everything you need to plan, book, and experience Ghana — all in one platform built for modern travelers.
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
                <p className="text-[#757B81] text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>

          {/* Additional trust signals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
            {[
              { icon: Shield, title: 'Safe & Trusted', desc: 'Verified information, safety tips, and travel advisories for every destination.' },
              { icon: Clock, title: 'Always Updated', desc: 'Prices, schedules, and information kept current so you always have accurate data.' },
              { icon: Globe, title: 'Ghana-First', desc: 'Built specifically for Ghana by people who love and know the country deeply.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-6 rounded-2xl border border-gray-100 dark:border-white/10">
                <div className="w-10 h-10 rounded-xl bg-[#FFD300]/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-[#FFD300]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#262B32] dark:text-white mb-1">{item.title}</h4>
                  <p className="text-[#757B81] text-sm">{item.desc}</p>
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
          <h2 className="font-['Playfair_Display',serif] text-3xl sm:text-5xl font-bold text-white mb-6">
            Ready to Experience Ghana?
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10">
            Join thousands of travelers who have used YɛnkɔGH to plan unforgettable trips across Ghana. Start your journey today — it's free.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-[#FFD300] hover:bg-yellow-400 text-[#090C11] font-bold px-10 py-5 rounded-xl text-lg transition-all duration-200 shadow-xl shadow-[#FFD300]/30"
            >
              Start Planning — It's Free
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

          <p className="text-white/40 text-sm mt-8">
            No credit card required · Prices in Ghana Cedi (₵) · Updated daily
          </p>
        </div>
      </section>
    </div>
  );
}
