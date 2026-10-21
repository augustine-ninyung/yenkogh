import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Heart, ArrowRight } from 'lucide-react';
import type { Event } from '@/types';
import { cn } from '@/utils/cn';
import { formatDateRange, formatCurrency } from '@/utils/formatters';
import { useFavorites } from '@/context/useFavorites';

interface EventCardProps {
  event: Event;
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({ event, className }) => {
  const { isEventSaved, toggleEvent } = useFavorites();
  const isSaved = isEventSaved(event.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleEvent(event.id);
  };

  return (
    <div
      className={cn(
        'group bg-white dark:bg-[#262B32] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 hover:border-[#FFD300]/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col',
        className
      )}
    >
      {/* Banner Image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100 dark:bg-white/5">
        <img
          src={event.imageUrl}
          alt={event.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/90 dark:bg-[#090C11]/90 text-[#090C11] dark:text-white backdrop-blur-md shadow-sm">
            {event.category}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          aria-label={isSaved ? `Remove ${event.name} from saved` : `Save ${event.name}`}
          className={cn(
            'absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD300] focus-visible:ring-offset-2',
            isSaved
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-black/30 text-white hover:bg-black/50 hover:scale-110'
          )}
        >
          <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
        </button>

        {/* Pricing Badge */}
        <div className="absolute bottom-3 left-3 z-10">
          {event.isFree ? (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm">
              Free Entry
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-[#FFD300] text-[#090C11] text-xs font-bold shadow-sm">
              From {formatCurrency(event.ticketPrice || 0)}
            </span>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Date & Location Info */}
          <div className="space-y-1.5 mb-2.5">
            <div className="flex items-center gap-1.5 text-xs text-muted dark:text-white/60">
              <Calendar size={13} className="text-[#FFD300] shrink-0" />
              <span className="font-medium text-[#090C11] dark:text-white/90">
                {formatDateRange(event.startDate, event.endDate)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted dark:text-white/60">
              <MapPin size={13} className="text-[#FFD300] shrink-0" />
              <span className="truncate">{event.location}, {event.region}</span>
            </div>
          </div>

          {/* Event Title */}
          <h3 className="font-semibold text-lg text-[#090C11] dark:text-white group-hover:text-[#FFD300] transition-colors line-clamp-1 mb-2">
            <Link to={`/events/${event.slug || event.id}`}>
              {event.name}
            </Link>
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-muted dark:text-white/70 line-clamp-2 leading-relaxed mb-4">
            {event.shortDescription || event.description}
          </p>
        </div>

        {/* Action Link */}
        <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-end">
          <Link
            to={`/events/${event.slug || event.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 text-[#090C11] dark:text-white hover:bg-[#FFD300] hover:text-[#090C11] transition-all"
          >
            <span>View Details</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
};
