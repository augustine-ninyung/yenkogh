import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Heart, ArrowRight } from 'lucide-react';
import type { Destination } from '@/types';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/formatters';
import { useFavorites } from '@/context/FavoritesContext';

interface DestinationCardProps {
  destination: Destination;
  className?: string;
  variant?: 'default' | 'compact' | 'featured';
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  className,
}) => {
  const { isDestinationSaved, toggleDestination } = useFavorites();
  const isSaved = isDestinationSaved(destination.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleDestination(destination.id);
  };

  const formattedType = destination.type
    ? destination.type.replace('-', ' ')
    : 'Attraction';

  return (
    <div
      className={cn(
        'group bg-white dark:bg-[#262B32] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 hover:border-[#FFD300]/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col',
        className
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-white/5">
        <img
          src={destination.imageUrl}
          alt={destination.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Type Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/90 dark:bg-[#090C11]/90 text-[#090C11] dark:text-white backdrop-blur-md shadow-sm">
            {formattedType}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          aria-label={isSaved ? `Remove ${destination.name} from saved` : `Save ${destination.name}`}
          className={cn(
            'absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD300] focus-visible:ring-offset-2',
            isSaved
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-black/30 text-white hover:bg-black/50 hover:scale-110'
          )}
        >
          <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
        </button>

        {/* Rating overlay */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-medium">
          <Star size={13} className="text-[#FFD300] fill-[#FFD300]" />
          {destination.reviewCount > 0 ? (
            <>
              <span>{destination.rating.toFixed(1)}</span>
              <span className="text-white/60">({destination.reviewCount})</span>
            </>
          ) : (
            <span>New</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Region */}
          <div className="flex items-center gap-1 text-xs text-muted dark:text-white/60 mb-1.5">
            <MapPin size={13} className="text-[#FFD300]" />
            <span className="font-medium">{destination.region} Region</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg text-[#090C11] dark:text-white group-hover:text-[#FFD300] transition-colors line-clamp-1 mb-2">
            <Link to={`/explore/${destination.slug || destination.id}`}>
              {destination.name}
            </Link>
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-muted dark:text-white/70 line-clamp-2 leading-relaxed mb-4">
            {destination.shortDescription || destination.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted dark:text-white/50 block">
              Est. Cost
            </span>
            <span className="text-sm font-bold text-[#090C11] dark:text-white">
              {formatCurrency(destination.estimatedCostPerPerson || 0)}
              <span className="text-xs font-normal text-muted dark:text-white/60"> / person</span>
            </span>
          </div>

          <Link
            to={`/explore/${destination.slug || destination.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 text-[#090C11] dark:text-white hover:bg-[#FFD300] hover:text-[#090C11] transition-all"
          >
            <span>Explore</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
};
