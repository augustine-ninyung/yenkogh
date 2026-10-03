import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Calendar, Filter, X } from 'lucide-react';
import { EventCard } from '@/components/cards/EventCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { useEvents } from '@/hooks/useEvents';
import { regions } from '@/data/regions';
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

export const EventsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get('q') || '';
  const categoryParam = (searchParams.get('cat') as EventCategory) || 'all';
  const regionParam = searchParams.get('region') || '';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>(categoryParam);
  const [selectedRegion, setSelectedRegion] = useState(regionParam);

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

    return result;
  }, [events, searchQuery, selectedCategory, selectedRegion]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedRegion('');
    setSearchParams({});
  };

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
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#757B81] w-4 h-4" />
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
              className="w-full md:w-auto px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#262B32] text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FFD300]"
            >
              <option value="">All Regions</option>
              {regions.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name} Region
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium shrink-0 transition-all ${
                selectedCategory === cat.value
                  ? 'bg-[#FFD300] text-[#090C11] font-bold shadow-sm'
                  : 'bg-white dark:bg-[#262B32] text-[#757B81] dark:text-white/80 border border-gray-200 dark:border-white/10 hover:border-gray-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results Info */}
        <div className="text-xs text-[#757B81] dark:text-white/60 mb-6">
          Showing <span className="font-bold text-[#090C11] dark:text-white">{filteredEvents.length}</span> upcoming events in Ghana
        </div>

        {/* Grid */}
        {isLoading ? (
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
            description="We couldn't find any festivals matching your selected criteria. Try resetting filters."
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
