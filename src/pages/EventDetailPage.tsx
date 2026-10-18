import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Heart,
  Share2,
  ChevronLeft,
  Bus,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { useEvent } from '@/hooks/useEvents';
import { getFestivalForEvent } from '@/data/festivals';
import { useFavorites } from '@/context/FavoritesContext';
import { useToast } from '@/context/ToastContext';
import { formatDateRange, formatCurrency } from '@/utils/formatters';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { safeUrl } from '@/utils/safeUrl';
import { commonsPage } from '@/utils/imageCredit';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { event, isLoading, error } = useEvent(id || '');
  const { isEventSaved, toggleEvent } = useFavorites();
  const { addToast } = useToast();

  if (isLoading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen pt-32 pb-20 max-w-xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold mb-3">Event Not Found</h2>
        <p className="text-muted mb-6">
          The event or festival you are looking for could not be found.
        </p>
        <ButtonLink to="/events" variant="primary">Return to Events</ButtonLink>
      </div>
    );
  }

  const isSaved = isEventSaved(event.id);
  const festival = getFestivalForEvent(event.id);

  const handleSave = () => {
    toggleEvent(event.id);
    addToast({
      variant: isSaved ? 'info' : 'success',
      title: isSaved ? 'Removed from Saved' : 'Saved to Favorites',
      message: `${event.name} has been updated in your saved events.`,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.name,
        text: event.shortDescription,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast({
        variant: 'info',
        title: 'Link Copied',
        message: 'Event link copied to clipboard!',
      });
    }
  };

  return (
    <div className="pt-20 pb-20 bg-gray-50 dark:bg-[#090C11] min-h-screen text-[#262B32] dark:text-white">
      {/* Top Nav Breadcrumbs */}
      <div className="bg-white dark:bg-[#262B32] border-b border-gray-100 dark:border-white/10 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-sm">
          <Link
            to="/events"
            className="flex items-center gap-1.5 text-muted hover:text-[#090C11] dark:hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Back to Events</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-muted transition-colors"
              aria-label="Share event"
            >
              <Share2 size={16} />
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isSaved
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30'
                  : 'bg-gray-100 text-[#090C11] dark:bg-white/10 dark:text-white'
              }`}
            >
              <Heart size={14} fill={isSaved ? 'currentColor' : 'none'} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner */}
        <div className="relative rounded-3xl overflow-hidden aspect-[21/9] max-h-[420px] mb-8 bg-gray-200 dark:bg-white/5">
          <img
            src={event.imageUrl}
            alt={event.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          {commonsPage(event.imageUrl) && (
            <a
              href={commonsPage(event.imageUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-3 right-4 text-[11px] text-white/70 hover:text-white transition-colors"
            >
              Photo: Wikimedia Commons
            </a>
          )}

          <div className="absolute bottom-6 left-6 right-6">
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#FFD300] text-[#090C11] inline-block mb-3">
              {event.category}
            </span>
            <h1 className="font-['Playfair_Display',serif] text-2xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-md">
              {event.name}
            </h1>
          </div>
        </div>

        {/* Content & Logistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-3">About the Celebration</h2>
              <p className="text-sm sm:text-base text-muted dark:text-white/80 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
              {festival && (
                <Link
                  to={`/festivals/${festival.id}`}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#262B32] dark:text-white hover:text-[#FFD300] transition-colors"
                >
                  Read the history and traditions of {festival.name}
                  <ArrowRight className="w-4 h-4 text-[#FFD300]" />
                </Link>
              )}
            </div>

            {event.activities && event.activities.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-3">Event Highlights & Program</h3>
                <ul className="space-y-2">
                  {event.activities.map((act, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted dark:text-white/80">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {event.transportInfo && (
              <div className="p-4 rounded-2xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Bus size={16} className="text-[#FFD300]" />
                  <span>Getting There</span>
                </div>
                <p className="text-xs sm:text-sm text-muted dark:text-white/70">
                  {event.transportInfo}
                </p>
              </div>
            )}
          </div>

          {/* Quick Info Box */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-lg space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted dark:text-white/60">
                Event Logistics
              </h3>

              <div className="space-y-3 text-xs sm:text-sm">
                <div>
                  <span className="text-muted block text-xs">Date:</span>
                  <div className="flex items-center gap-1.5 font-semibold text-[#090C11] dark:text-white">
                    <Calendar size={14} className="text-[#FFD300]" />
                    <span>{formatDateRange(event.startDate, event.endDate)}</span>
                  </div>
                </div>

                <div>
                  <span className="text-muted block text-xs">Location & Venue:</span>
                  <div className="flex items-center gap-1.5 font-semibold text-[#090C11] dark:text-white">
                    <MapPin size={14} className="text-[#FFD300]" />
                    <span>{event.venue || event.location}, {event.region}</span>
                  </div>
                </div>

                <div>
                  <span className="text-muted block text-xs">Admission:</span>
                  <span className="font-bold text-base text-[#090C11] dark:text-white">
                    {event.isFree ? 'Free Admission' : formatCurrency(event.ticketPrice || 0)}
                  </span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => navigate(`/planner?destination=${event.location}`)}
                >
                  Plan Trip to this Festival
                </Button>

                {safeUrl(event.website) && (
                  <a
                    href={safeUrl(event.website)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-semibold rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <span>Official Festival Page</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
