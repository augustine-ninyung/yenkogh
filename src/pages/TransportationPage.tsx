import React, { useState, useMemo } from 'react';
import {
  Search,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useTransportation, useTransportSearch } from '@/hooks/useTransportation';
import { TransportCard } from '@/components/cards/TransportCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import type { TransportType } from '@/types';

const CITIES = [
  'Accra',
  'Kumasi',
  'Cape Coast',
  'Tamale',
  'Takoradi',
  'Ho',
  'Sunyani',
  'Bolgatanga',
];

const TRANSPORT_TABS: { label: string; type: TransportType | 'all' }[] = [
  { label: 'All Modes', type: 'all' },
  { label: 'Intercity Buses', type: 'bus' },
  { label: 'Trotro (Minibus)', type: 'trotro' },
  { label: 'Uber & Bolt', type: 'ride-hailing' },
  { label: 'Taxis & Shared', type: 'taxi' },
  { label: 'Domestic Flights', type: 'domestic-flight' },
  { label: 'Lake Ferry & Boat', type: 'boat' },
];

export const TransportationPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<TransportType | 'all'>('all');
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');

  const { transportation } = useTransportation();
  const { results: routeResults, search: executeRouteSearch } = useTransportSearch('', '');

  const [hasSearched, setHasSearched] = useState(false);

  const handleRouteSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromCity && toCity) {
      executeRouteSearch(fromCity, toCity);
      setHasSearched(true);
    }
  };

  const clearRouteSearch = () => {
    setFromCity('');
    setToCity('');
    setHasSearched(false);
  };

  const displayedTransport = useMemo(() => {
    let list = hasSearched ? routeResults : transportation;
    if (selectedType !== 'all') {
      list = list.filter((t) => t.type === selectedType);
    }
    return list;
  }, [hasSearched, routeResults, transportation, selectedType]);

  return (
    <div className="pt-20 pb-20 bg-gray-50 dark:bg-[#090C11] min-h-screen text-[#262B32] dark:text-white">
      <PageHeader title="Getting around" description="Buses, trotros, taxis, flights and ferries: typical fares in cedis, journey times and safety tips." />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Route Search Box */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-lg">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#090C11] dark:text-white mb-4 flex items-center gap-2">
            <Search size={18} className="text-[#FFD300]" />
            <span>Search Intercity Routes & Estimated Costs</span>
          </h2>

          <form onSubmit={handleRouteSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="transportation-departure" className="text-xs font-semibold text-muted dark:text-white/70 block mb-1.5 uppercase">
                Departure (From)
              </label>
              <select id="transportation-departure"
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11] text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD300]"
              >
                <option value="">Select origin city...</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="transportation-destination" className="text-xs font-semibold text-muted dark:text-white/70 block mb-1.5 uppercase">
                Destination (To)
              </label>
              <select id="transportation-destination"
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11] text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD300]"
              >
                <option value="">Select destination city...</option>
                {CITIES.filter((c) => c !== fromCity).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={!fromCity || !toCity}
                className="h-[42px]"
              >
                Search Routes
              </Button>
              {hasSearched && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearRouteSearch}
                  className="h-[42px]"
                >
                  Reset
                </Button>
              )}
            </div>
          </form>

          {hasSearched && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between text-xs text-muted">
              <span>
                Found transport connecting <strong>{fromCity}</strong> and <strong>{toCity}</strong>
              </span>
              <button onClick={clearRouteSearch} className="text-accent-ink hover:underline font-semibold">
                Show All Transport Options
              </button>
            </div>
          )}
        </div>

        {/* Transport Type Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {TRANSPORT_TABS.map((tab) => (
            <button
              key={tab.type}
              onClick={() => setSelectedType(tab.type)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium shrink-0 transition-all ${
                selectedType === tab.type
                  ? 'bg-[#FFD300] text-[#090C11] font-bold shadow-sm'
                  : 'bg-white dark:bg-[#262B32] text-muted dark:text-white/80 border border-gray-200 dark:border-white/10 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Available Transport Options</h2>
            <span className="text-xs text-muted">
              {displayedTransport.length} transport modes available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedTransport.map((t) => (
              <TransportCard key={t.id} transport={t} />
            ))}
          </div>
        </div>

        {/* Ghana Travel & Safety Advice */}
        <div id="safety" className="p-8 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#FFD300]/20 text-[#090C11] dark:text-[#FFD300]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Ghana Transportation Tips for Travelers</h2>
              <p className="text-xs text-muted">Local wisdom for seamless travel across Ghana</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-2">
              <h3 className="font-bold text-[#090C11] dark:text-white flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span>Trotro Etiquette</span>
              </h3>
              <p className="text-muted dark:text-white/70 leading-relaxed">
                Always carry small cedi notes (₵5, ₵10, ₵20). Confirm your stop with the conductor ("mate") when getting in. Say "Bus stop!" clearly when you want to alight.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-2">
              <h3 className="font-bold text-[#090C11] dark:text-white flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span>Intercity Bus Booking</span>
              </h3>
              <p className="text-muted dark:text-white/70 leading-relaxed">
                For STC and VIP coaches, arrive at the terminal at least 45 minutes before departure. Friday afternoons and Sunday evenings see heavy traffic on the Accra–Kumasi corridor.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-2">
              <h3 className="font-bold text-[#090C11] dark:text-white flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span>Taxis & Ride-Hailing</span>
              </h3>
              <p className="text-muted dark:text-white/70 leading-relaxed">
                In Accra, Kumasi, and Takoradi, Bolt and Uber provide fixed upfront pricing. For regular street taxis, agree on the total price before stepping inside the vehicle.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportationPage;
