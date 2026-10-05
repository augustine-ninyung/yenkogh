import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { FestivalCard } from '@/components/cards/FestivalCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { festivals, getFestivalMonths, MONTH_NAMES } from '@/data/festivals';
import { regions } from '@/data/regions';
import type { FestivalCategory } from '@/types';
import { FESTIVAL_CATEGORY_META } from './festivalMeta';

// Month filter value for festivals with no fixed calendar month
const NO_FIXED_MONTH = 'varies';

const selectClass =
  'w-full md:w-auto px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#262B32] text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FFD300]';

// Only offer categories that at least one festival uses, most common first
const CATEGORY_OPTIONS = (Object.keys(FESTIVAL_CATEGORY_META) as FestivalCategory[])
  .map((value) => ({ value, count: festivals.filter((f) => f.category === value).length }))
  .filter((c) => c.count > 0)
  .sort((a, b) => b.count - a.count);

export const FestivalBrowser: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState('');
  const [month, setMonth] = useState('');
  const [category, setCategory] = useState<FestivalCategory | 'all'>('all');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return festivals.filter((f) => {
      if (q) {
        const haystack = [f.name, ...f.alternateNames, f.town, f.traditionalArea, f.ethnicGroup, f.region]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (region && f.region !== region && !f.otherRegions.includes(region)) return false;
      if (category !== 'all' && f.category !== category) return false;
      if (month) {
        const months = getFestivalMonths(f);
        if (month === NO_FIXED_MONTH ? months.length > 0 : !months.includes(Number(month))) return false;
      }
      return true;
    });
  }, [searchQuery, region, month, category]);

  const hasFilters = Boolean(searchQuery || region || month || category !== 'all');
  const clearFilters = () => {
    setSearchQuery('');
    setRegion('');
    setMonth('');
    setCategory('all');
  };

  return (
    <div>
      {/* Search, region and month */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#757B81] w-4 h-4" />
          <input
            type="text"
            placeholder="Search by festival, town or people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search festivals"
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#262B32] text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD300]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="w-full md:w-auto flex items-center gap-3">
          <select value={region} onChange={(e) => setRegion(e.target.value)} aria-label="Filter by region" className={selectClass}>
            <option value="">All Regions</option>
            {regions.map((r) => (
              <option key={r.code} value={r.name}>
                {r.name} Region
              </option>
            ))}
          </select>
          <select value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Filter by month" className={selectClass}>
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

      {/* Category pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {[{ value: 'all' as const, count: festivals.length }, ...CATEGORY_OPTIONS].map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium shrink-0 transition-all ${
              category === cat.value
                ? 'bg-[#FFD300] text-[#090C11] font-bold shadow-sm'
                : 'bg-white dark:bg-[#262B32] text-[#757B81] dark:text-white/80 border border-gray-200 dark:border-white/10 hover:border-gray-300'
            }`}
          >
            {cat.value === 'all' ? 'All Festivals' : FESTIVAL_CATEGORY_META[cat.value].label}
            <span className="ml-1.5 opacity-60">{cat.count}</span>
          </button>
        ))}
      </div>

      {/* Results info */}
      <div className="flex items-center justify-between text-xs text-[#757B81] dark:text-white/60 mb-6">
        <span>
          Showing <span className="font-bold text-[#090C11] dark:text-white">{filtered.length}</span> of {festivals.length} traditional festivals
        </span>
        {hasFilters && (
          <button onClick={clearFilters} className="font-semibold text-[#262B32] dark:text-white hover:text-[#FFD300] transition-colors">
            Reset filters
          </button>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((f) => (
            <FestivalCard key={f.id} festival={f} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No festivals found"
          description="No festival matches these filters. Try a different region or month."
          action={{ label: 'Reset Filters', onClick: clearFilters }}
        />
      )}
    </div>
  );
};

export default FestivalBrowser;
