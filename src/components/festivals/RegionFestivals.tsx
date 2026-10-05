import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { FestivalCard } from '@/components/cards/FestivalCard';
import { festivals, getFestivalsByRegion } from '@/data/festivals';
import { regions } from '@/data/regions';
import { cn } from '@/utils/cn';

interface RegionFestivalsProps {
  /** Region name, e.g. "Central". Leave empty to feature festivals from across Ghana. */
  regionName?: string;
  className?: string;
}

// Best-documented festivals first, and those with a photo ahead of those without
const byRichness = (a: (typeof festivals)[number], b: (typeof festivals)[number]) =>
  Number(Boolean(b.image)) - Number(Boolean(a.image)) ||
  Number(b.completeness === 'detailed') - Number(a.completeness === 'detailed');

// ─── RegionFestivals ──────────────────────────────────────────────────────────
// A three-card preview of a region's festivals with a link to the full,
// pre-filtered list on the Events page. Renders nothing for a region with none.

export const RegionFestivals: React.FC<RegionFestivalsProps> = ({ regionName, className }) => {
  const all = regionName ? getFestivalsByRegion(regionName) : festivals;
  if (all.length === 0) return null;

  const preview = [...all].sort(byRichness).slice(0, 3);
  const regionCode = regions.find((r) => r.name === regionName)?.code;
  const listUrl = regionCode ? `/events?view=festivals&region=${regionCode}` : '/events?view=festivals';

  return (
    <div className={cn('mt-20 pt-10 border-t border-gray-200 dark:border-white/10', className)}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h3 className="font-['Playfair_Display',serif] text-2xl font-bold">
            {regionName ? `Festivals in the ${regionName} Region` : 'Festivals Across Ghana'}
          </h3>
          <p className="text-sm text-[#757B81] dark:text-white/60 mt-1">
            {regionName
              ? 'Time your visit around a traditional celebration.'
              : 'Pick a region to see its celebrations, or browse them all.'}
          </p>
        </div>
        <Link
          to={listUrl}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#262B32] dark:text-white hover:gap-3 transition-all shrink-0"
        >
          {all.length > preview.length ? `See all ${all.length} festivals` : 'Open in Events'}
          <ArrowRight className="w-4 h-4 text-[#FFD300]" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {preview.map((f) => (
          <FestivalCard key={f.id} festival={f} />
        ))}
      </div>
    </div>
  );
};

export default RegionFestivals;
