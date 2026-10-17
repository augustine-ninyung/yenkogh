import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { EventCard } from '@/components/cards/EventCard';
import { FestivalCard } from '@/components/cards/FestivalCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { useEvents } from '@/hooks/useEvents';
import { regions } from '@/data/regions';
import { festivals, getFestivalMonths, FESTIVAL_EVENT_CATEGORY, MONTH_NAMES } from '@/data/festivals';
import type { EventCategory } from '@/types';

const CATEGORIES: { label: string; value: EventCategory | 'all' }[] = [
  { label: 'All Festivals & Events', value: 'all' },
  { label: 'Traditional & Harvest', value: 'traditional' },
  { label: 'Cultural & Heritage', value: 'cultural' },
  { label: 'Art & Exhibitions', value: 'art' },
  { label: 'Music & Concerts', value: 'music' },
  { label: 'Food & Culinary', value: 'food' },
  { label: 'Religious Ceremonies', value: 'religious' },
];

// Month filter value for festivals that follow a lunar or recurring calendar
const NO_FIXED_MONTH = 'varies';

const selectClass =
  'w-full md:w-auto px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#262B32] text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FFD300]';

export const EventsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get('q') || '';
  const categoryParam = (searchParams.get('cat') as EventCategory) || 'all';
  const regionParam = searchParams.get('region') || '';
  const monthParam = searchParams.get('month') || '';
  // Dated events, or the full calendar of traditional festivals; both share the filters below
  const view = searchParams.get('view') === 'festivals' ? 'festivals' : 'events';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>(categoryParam);
  const [selectedRegion, setSelectedRegion] = useState(regionParam);
  const [selectedMonth, setSelectedMonth] = useState(monthParam);

  const { events, isLoading } = useEvents();

  const filteredEvents = useMemo(() => {
    let result = [...events];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.region.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((e) => e.category === selectedCategory);
    }

    if (selectedRegion) {
      result = result.filter((e) => e.regionCode === selectedRegion || e.region.toLowerCase() === selectedRegion.toLowerCase());
    }

    if (selectedMonth) {
      result = result.filter(
        (e) => selectedMonth !== NO_FIXED_MONTH && new Date(e.startDate).getMonth() === Number(selectedMonth)
      );
    }

    return result;
  }, [events, searchQuery, selectedCategory, selectedRegion, selectedMonth]);

  const filteredFestivals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    // The region filter holds a region code; festivals are keyed by region name
    const regionName =
      regions.find((r) => r.code === selectedRegion || r.name.toLowerCase() === selectedRegion.toLowerCase())?.name ?? '';

    return festivals.filter((f) => {
      if (q) {
        const haystack = [f.name, ...f.alternateNames, f.description, f.town, f.traditionalArea, f.ethnicGroup, f.region]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (selectedCategory !== 'all' && FESTIVAL_EVENT_CATEGORY[f.category] !== selectedCategory) return false;
      if (selectedRegion && f.region !== regionName && !f.otherRegions.includes(regionName)) return false;
      if (selectedMonth) {
        const months = getFestivalMonths(f);
        if (selectedMonth === NO_FIXED_MONTH ? months.length > 0 : !months.includes(Number(selectedMonth))) return false;
      }
      return true;
    });
  }, [searchQuery, selectedCategory, selectedRegion, selectedMonth]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedRegion('');
    setSelectedMonth('');
    setSearchParams(view === 'festivals' ? { view } : {});
  };

  const tabs = [
    { value: 'events', label: 'Upcoming Events', count: isLoading ? null : filteredEvents.length },
    { value: 'festivals', label: 'Traditional Festivals', count: filteredFestivals.length },
  ] as const;

  return (
    <div className="pt-24 pb-20 bg-gray-50 dark:bg-[#090C11] min-h-screen text-[#262B32] dark:text-white">
      {/* Header Banner */}
      <div className="bg-[#262B32] dark:bg-[#090C11] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <Badge variant="warning" className="mb-3">
            Festivals & Experiences
          </Badge>
          <h1 className="font-['Playfair_Display',serif] text-3xl sm:text-5xl font-bold mb-3">
            Ghana Festivals & Cultural Events
          </h1>
          <p className="text-white/70 max-w-2xl text-sm sm:text-base">
            Celebrate life, ancestral legacy, and creativity. Discover durbars, street art celebrations, music festivals, and traditional rites throughout the regions.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Search festivals by name, town..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#262B32] text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD300]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="w-full md:w-auto flex items-center gap-3">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              aria-label="Filter by region"
              className={selectClass}
            >
              <option value="">All Regions</option>
              {regions.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name} Region
                </option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              aria-label="Filter by month"
              className={selectClass}
            >
              <option value="">Any Month</option>
              {MONTH_NAMES.map((name, i) => (
                <option key={name} value={i}>
                  {name}
                </option>
              ))}
              <option value={NO_FIXED_MONTH}>No fixed month</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium shrink-0 transition-all ${
                selectedCategory === cat.value
                  ? 'bg-[#FFD300] text-[#090C11] font-bold shadow-sm'
                  : 'bg-white dark:bg-[#262B32] text-muted dark:text-white/80 border border-gray-200 dark:border-white/10 hover:border-gray-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* View Tabs: counts follow the filters above */}
        <div className="flex items-center gap-6 border-b border-gray-200 dark:border-white/10 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                if (tab.value === 'festivals') next.set('view', 'festivals');
                else next.delete('view');
                setSearchParams(next);
              }}
              aria-pressed={view === tab.value}
              className={`-mb-px pb-3 text-sm font-semibold border-b-2 transition-colors ${
                view === tab.value
                  ? 'border-[#FFD300] text-[#090C11] dark:text-white'
                  : 'border-transparent text-muted dark:text-white/60 hover:text-[#262B32] dark:hover:text-white'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-2 rounded-full bg-gray-200 dark:bg-white/10 px-2 py-0.5 text-xs font-bold">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Results Info */}
        <div className="text-xs text-muted dark:text-white/60 mb-6">
          {view === 'festivals' ? (
            <>
              Showing <span className="font-bold text-[#090C11] dark:text-white">{filteredFestivals.length}</span> of {festivals.length} traditional festivals in Ghana
            </>
          ) : (
            <>
              Showing <span className="font-bold text-[#090C11] dark:text-white">{filteredEvents.length}</span> upcoming events in Ghana
            </>
          )}
        </div>

        {/* Grid */}
        {view === 'festivals' ? (
          filteredFestivals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFestivals.map((f) => (
                <FestivalCard key={f.id} festival={f} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No festivals found"
              description="No traditional festival matches your selected criteria. Try resetting filters."
              action={{
                label: 'Reset Filters',
                onClick: clearFilters,
              }}
            />
          )
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-gray-200 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No events found"
            description={
              filteredFestivals.length > 0
                ? `No upcoming events match, but ${filteredFestivals.length} traditional festivals do. Switch to the Traditional Festivals tab to see them.`
                : "We couldn't find any festivals matching your selected criteria. Try resetting filters."
            }
            action={{
              label: 'Reset Filters',
              onClick: clearFilters,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default EventsPage;
