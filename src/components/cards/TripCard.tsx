import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Trash2, ArrowRight } from 'lucide-react';
import type { Trip } from '@/types';
import { cn } from '@/utils/cn';
import { formatDateRange } from '@/utils/formatters';

interface TripCardProps {
  trip: Trip;
  onDelete?: (id: string) => void;
  className?: string;
}

const statusBadge = (status: Trip['status']) => {
  switch (status) {
    case 'planning':
      return { label: 'Planning', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' };
    case 'upcoming':
      return { label: 'Upcoming', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' };
    case 'ongoing':
      return { label: 'Ongoing', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' };
    case 'completed':
      return { label: 'Completed', bg: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' };
    default:
      return { label: status, bg: 'bg-gray-100 text-gray-800' };
  }
};

export const TripCard: React.FC<TripCardProps> = ({ trip, onDelete, className }) => {
  const badge = statusBadge(trip.status);

  return (
    <div
      className={cn(
        'bg-white dark:bg-[#262B32] rounded-2xl p-5 border border-gray-100 dark:border-white/10 hover:border-[#FFD300]/40 transition-all duration-300 hover:shadow-lg flex flex-col justify-between',
        className
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize', badge.bg)}>
            {badge.label}
          </span>

          {onDelete && (
            <button
              onClick={() => onDelete(trip.id)}
              className="text-[#757B81] hover:text-red-500 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              aria-label={`Delete trip ${trip.name}`}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>

        <h3 className="font-bold text-lg text-[#090C11] dark:text-white mb-2 line-clamp-1">
          {trip.name}
        </h3>

        <div className="space-y-2 text-xs text-[#757B81] dark:text-white/70 mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-[#FFD300] shrink-0" />
            <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-[#FFD300] shrink-0" />
            <span>{trip.destinations?.length || 0} Destinations selected</span>
          </div>

          <div className="flex items-center gap-2">
            <Users size={14} className="text-[#FFD300] shrink-0" />
            <span>{trip.numberOfTravelers} {trip.numberOfTravelers === 1 ? 'Traveler' : 'Travelers'}</span>
          </div>
        </div>

        {trip.itinerary && (
          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 mb-4 text-xs">
            <p className="font-semibold text-[#090C11] dark:text-white truncate">
              {trip.itinerary.title}
            </p>
            <p className="text-[#757B81] dark:text-white/60">
              {trip.itinerary.days?.length || 0} Days Planned
            </p>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-end">
        <Link
          to={`/planner?tripId=${trip.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 text-[#090C11] dark:text-white hover:bg-[#FFD300] hover:text-[#090C11] transition-all"
        >
          <span>View Itinerary</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
};
