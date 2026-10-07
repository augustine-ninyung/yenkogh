import React, { useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import { DestinationCard } from '@/components/cards/DestinationCard';
import { DestinationCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { useDestinations } from '@/hooks/useDestinations';
import { regions } from '@/data/regions';
import { scrollToStart } from '@/utils/scroll';
import { RegionFestivals } from '@/components/festivals/RegionFestivals';
import type { DestinationType, SortOption } from '@/types';

const DESTINATION_TYPES: { label: string; value: DestinationType | 'all' }[] = [
  { label: 'All Categories', value: 'all' },
  { label: 'Historical & Castles', value: 'historical' },
  { label: 'National Parks', value: 'national-park' },
  { label: 'Waterfalls', value: 'waterfall' },
  { label: 'Beaches & Coast', value: 'beach' },
  { label: 'Wildlife & Safaris', value: 'wildlife' },
  { label: 'Cultural & Heritage', value: 'cultural' },
  { label: 'Lakes & Rivers', value: 'lake' },
  { label: 'Botanical Gardens', value: 'botanical' },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Most Popular / Featured', value: 'rating-desc' },
  { label: 'Name (A to Z)', value: 'name-asc' },
  { label: 'Name (Z to A)', value: 'name-desc' },
  { label: 'Price (Low to High)', value: 'cost-asc' },
  { label: 'Price (High to Low)', value: 'cost-desc' },
];

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get('q') || '';
  const regionParam = searchParams.get('region') || '';
  const typeParam = (searchParams.get('type') as DestinationType) || 'all';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedRegion, setSelectedRegion] = useState(regionParam);
  const [selectedType, setSelectedType] = useState<DestinationType | 'all'>(typeParam);
  const [sortBy, setSortBy] = useState<SortOption>('rating-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const resultsRef = useRef<HTMLElement>(null);

  const { destinations, isLoading } = useDestinations();

  // Filter & Search Logic
  const filteredDestinations = useMemo(() => {
    let result = [...destinations];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.region.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedRegion) {
      result = result.filter((d) => d.regionCode === selectedRegion || d.region.toLowerCase() === selectedRegion.toLowerCase());
    }

    if (selectedType !== 'all') {
      result = result.filter((d) => d.type === selectedType);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'rating-desc':
          return b.rating - a.rating;
        case 'cost-asc':
          return (a.estimatedCostPerPerson || 0) - (b.estimatedCostPerPerson || 0);
        case 'cost-desc':
          return (b.estimatedCostPerPerson || 0) - (a.estimatedCostPerPerson || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [destinations, searchQuery, selectedRegion, selectedType, sortBy]);

  // Pagination (6 items per page)
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredDestinations.length / itemsPerPage) || 1;
  const paginatedDestinations = filteredDestinations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRegion('');
    setSelectedType('all');
    setSortBy('rating-desc');
    setCurrentPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = searchQuery || selectedRegion || selectedType !== 'all';

  return (
    <div className="pt-24 pb-20 bg-gray-50 dark:bg-[#090C11] min-h-screen text-[#262B32] dark:text-white">
      {/* Header Banner */}
      <div className="bg-[#262B32] dark:bg-[#090C11] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <Badge variant="primary" className="mb-3">
            Destinations & Attractions
          </Badge>
          <h1 className="font-['Playfair_Display',serif] text-3xl sm:text-5xl font-bold mb-3">
            Explore Ghana's Marvels
          </h1>
          <p className="text-white/70 max-w-2xl text-sm sm:text-base">
            From the historic ramparts of Cape Coast Castle to the wild savannah of Mole National Park, uncover the rich cultural and natural tapestry of Ghana.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Mobile Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#757B81] w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, tags, or town..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
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

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#262B32] text-sm font-medium"
            >
              <Filter size={16} />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#FFD300]" />
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#757B81] hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#262B32] text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FFD300]"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Layout Grid: Sidebar Filters (Desktop) + Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block space-y-6">
            <div className="bg-white dark:bg-[#262B32] p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase tracking-wider text-[#090C11] dark:text-white">
                  Filter Places
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-[#FFD300] hover:underline font-medium"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-xs font-semibold text-[#757B81] dark:text-white/70 block mb-2 uppercase">
                  Category
                </label>
                <div className="space-y-1">
                  {DESTINATION_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => {
                        setSelectedType(type.value);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        selectedType === type.value
                          ? 'bg-[#FFD300] text-[#090C11] font-semibold'
                          : 'text-[#757B81] dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/5'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Region Filter */}
              <div>
                <label className="text-xs font-semibold text-[#757B81] dark:text-white/70 block mb-2 uppercase">
                  Region
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => {
                    setSelectedRegion(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#090C11] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FFD300]"
                >
                  <option value="">All 16 Regions</option>
                  {regions.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.name} Region
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Modal */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex items-end">
              <div className="bg-white dark:bg-[#262B32] w-full rounded-t-3xl max-h-[85vh] overflow-y-auto p-6 space-y-6 animate-in slide-in-from-bottom duration-250">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
                  <h3 className="font-bold text-lg">Filters</h3>
                  <button onClick={() => setMobileFilterOpen(false)}>
                    <X size={20} />
                  </button>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#757B81] block mb-2 uppercase">Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {DESTINATION_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => {
                          setSelectedType(type.value);
                          setCurrentPage(1);
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border text-center ${
                          selectedType === type.value
                            ? 'bg-[#FFD300] border-[#FFD300] text-[#090C11] font-semibold'
                            : 'border-gray-200 dark:border-white/10 text-[#757B81] dark:text-white/80'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#757B81] block mb-2 uppercase">Region</label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => {
                      setSelectedRegion(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#090C11] text-sm"
                  >
                    <option value="">All 16 Regions</option>
                    {regions.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.name} Region
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
                  <button
                    onClick={clearFilters}
                    className="flex-1 py-3 text-sm font-semibold rounded-xl border border-gray-200 dark:border-white/10"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="flex-1 py-3 text-sm font-semibold rounded-xl bg-[#FFD300] text-[#090C11]"
                  >
                    Show Results
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Destination Results Grid */}
          <main ref={resultsRef} className="lg:col-span-3">
            {/* Active Pills */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs text-[#757B81]">Active filters:</span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-200 dark:bg-white/10 text-xs">
                    "{searchQuery}"
                    <X size={12} className="cursor-pointer" onClick={() => setSearchQuery('')} />
                  </span>
                )}
                {selectedType !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFD300]/20 text-[#090C11] dark:text-[#FFD300] text-xs font-medium">
                    Type: {selectedType}
                    <X size={12} className="cursor-pointer" onClick={() => setSelectedType('all')} />
                  </span>
                )}
                {selectedRegion && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                    Region: {selectedRegion}
                    <X size={12} className="cursor-pointer" onClick={() => setSelectedRegion('')} />
                  </span>
                )}
                <button onClick={clearFilters} className="text-xs text-[#FFD300] hover:underline ml-2">
                  Clear all
                </button>
              </div>
            )}

            <div className="text-xs text-[#757B81] dark:text-white/60 mb-4">
              Showing <span className="font-bold text-[#090C11] dark:text-white">{filteredDestinations.length}</span> destinations in Ghana
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <DestinationCardSkeleton key={i} />
                ))}
              </div>
            ) : paginatedDestinations.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedDestinations.map((dest) => (
                    <DestinationCard key={dest.id} destination={dest} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={(page) => {
                        setCurrentPage(page);
                        // Start the new page of results at its top, not at the pagination bar
                        scrollToStart(resultsRef.current);
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                title="No destinations match your criteria"
                description="Try adjusting your keywords, selecting a different region, or clearing some filters."
                action={{
                  label: 'Clear All Filters',
                  onClick: clearFilters,
                }}
              />
            )}
          </main>
        </div>

        {/* Festivals for the selected region, or a preview from across Ghana */}
        <RegionFestivals
          regionName={regions.find((r) => r.code === selectedRegion || r.name.toLowerCase() === selectedRegion.toLowerCase())?.name}
        />
      </div>
    </div>
  );
};

export default ExplorePage;
