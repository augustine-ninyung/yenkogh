import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Star,
  Clock,
  Heart,
  Share2,
  Sparkles,
  ShieldAlert,
  Bus,
  CheckCircle2,
  ChevronLeft,
} from 'lucide-react';
import { useDestination, useDestinations } from '@/hooks/useDestinations';
import { useFavorites } from '@/context/FavoritesContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency } from '@/utils/formatters';
import { ImageGallery } from '@/components/ui/ImageGallery';
import { DestinationCard } from '@/components/cards/DestinationCard';
import { RegionFestivals } from '@/components/festivals/RegionFestivals';
import { Button, ButtonLink } from '@/components/ui/Button';
import { FeedbackDialog } from '@/components/FeedbackDialog';
import { Spinner } from '@/components/ui/Spinner';
import { recordDestinationView } from '@/services/viewService';
import { safeUrl } from '@/utils/safeUrl';
import { creditFor } from '@/utils/imageCredit';

export const DestinationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { destination, isLoading, error } = useDestination(id || '');
  const { destinations } = useDestinations();
  const { isDestinationSaved, toggleDestination } = useFavorites();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'transport' | 'safety'>('overview');

  // Counted once per browser session, for the admin's most-viewed figures
  const viewedId = destination?.id;
  useEffect(() => {
    if (viewedId) recordDestinationView(viewedId);
  }, [viewedId]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen pt-32 pb-20 max-w-xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold mb-3">Destination Not Found</h2>
        <p className="text-muted mb-6">
          The destination you are looking for may have been moved or does not exist.
        </p>
        <ButtonLink to="/explore" variant="primary">Return to Destinations</ButtonLink>
      </div>
    );
  }

  const isSaved = isDestinationSaved(destination.id);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: destination.name,
        text: destination.shortDescription,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast({
        variant: 'info',
        title: 'Link Copied',
        message: 'Destination link copied to clipboard!',
      });
    }
  };

  const handleSave = () => {
    toggleDestination(destination.id);
    addToast({
      variant: isSaved ? 'info' : 'success',
      title: isSaved ? 'Removed from Saved' : 'Saved to Favorites',
      message: `${destination.name} has been updated in your saved places.`,
    });
  };

  const nearbyItems = destinations.filter((d) =>
    destination.nearbyDestinations?.includes(d.id)
  );

  // The main photo leads, unless the gallery already starts with it
  const galleryImages = [
    ...((destination.gallery || []).some((g) => g.url === destination.imageUrl) ? [] : [{ url: destination.imageUrl, alt: destination.name }]),
    ...(destination.gallery || []).map((g) => ({
      url: g.url,
      alt: g.alt || destination.name,
      caption: g.caption,
    })),
  ];

  return (
    <div className="pt-20 pb-20 bg-gray-50 dark:bg-[#090C11] min-h-screen text-[#262B32] dark:text-white">
      {/* Top Breadcrumb Bar */}
      <div className="bg-white dark:bg-[#262B32] border-b border-gray-100 dark:border-white/10 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-sm">
          <Link
            to="/explore"
            className="flex items-center gap-1.5 text-muted hover:text-[#090C11] dark:hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Back to Explore</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-muted transition-colors"
              aria-label="Share destination"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#FFD300]/20 text-[#090C11] dark:text-[#FFD300]">
              {destination.type.replace('-', ' ')}
            </span>
            <span className="text-xs text-muted dark:text-white/60 flex items-center gap-1">
              <MapPin size={12} className="text-[#FFD300]" />
              {destination.region} Region, Ghana
            </span>
          </div>

          <h1 className="font-['Playfair_Display',serif] text-3xl sm:text-5xl font-bold mb-3">
            {destination.name}
          </h1>

          <div className="flex items-center gap-4 text-xs sm:text-sm text-muted dark:text-white/70">
            <div className="flex items-center gap-1">
              <Star size={16} className="text-[#FFD300] fill-[#FFD300]" />
              {destination.reviewCount > 0 ? (
                <>
                  <span className="font-bold text-[#090C11] dark:text-white">{destination.rating.toFixed(1)}</span>
                  <span>({destination.reviewCount} reviews)</span>
                </>
              ) : (
                <span>Not yet rated</span>
              )}
            </div>
            {destination.openingHours && (
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{destination.openingHours}</span>
              </div>
            )}
          </div>
        </div>

        {/* Gallery */}
        <div className="mb-10">
          <ImageGallery images={galleryImages} />
          {safeUrl(creditFor(destination.imageUrl, destination.imageCredit)) && (
            <p className="mt-2 text-xs text-muted">
              Main photo:{' '}
              <a href={safeUrl(creditFor(destination.imageUrl, destination.imageCredit))} target="_blank" rel="noopener noreferrer" className="underline hover:text-[#090C11] dark:hover:text-white">
                author and licence on Wikimedia Commons
              </a>
            </p>
          )}
        </div>

        {/* 2-Column Content + Booking Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-white/10 gap-6 text-sm font-semibold">
              {(
                [
                  { id: 'overview', label: 'Overview' },
                  { id: 'activities', label: 'Things to Do' },
                  { id: 'transport', label: 'Getting There' },
                  { id: 'safety', label: 'Travel & Safety' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 relative transition-colors ${
                    activeTab === tab.id
                      ? 'text-[#090C11] dark:text-white border-b-2 border-[#FFD300]'
                      : 'text-muted hover:text-[#090C11] dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-3">About this Destination</h3>
                  <p className="text-sm sm:text-base text-muted dark:text-white/80 leading-relaxed whitespace-pre-line">
                    {destination.description}
                  </p>
                </div>

                {destination.bestTimeToVisit && (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-3">
                    <Sparkles className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={18} />
                    <div>
                      <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-0.5">
                        Best Time to Visit
                      </h4>
                      <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300">
                        {destination.bestTimeToVisit}
                      </p>
                    </div>
                  </div>
                )}

                {destination.tags && destination.tags.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase font-semibold text-muted mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {destination.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-lg text-xs bg-gray-100 dark:bg-white/10 text-muted dark:text-white/80"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Activities */}
            {activeTab === 'activities' && (
              <div className="space-y-6">
                <h3 className="font-bold text-lg mb-3">Activities & Highlights</h3>

                {destination.activities && destination.activities.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {destination.activities.map((act) => (
                      <div
                        key={act.id}
                        className="p-4 rounded-2xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm">{act.name}</h4>
                          {act.cost !== undefined && (
                            <span className="text-xs font-bold text-accent-ink">
                              {act.cost === 0 ? 'Free' : formatCurrency(act.cost)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted dark:text-white/70 leading-relaxed">
                          {act.description}
                        </p>
                        {act.duration && (
                          <span className="text-[11px] text-muted block mt-2">
                            Duration: {act.duration}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-2.5">
                    {destination.thingsToDo?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-muted dark:text-white/80">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Tab: Transport */}
            {activeTab === 'transport' && (
              <div className="space-y-6">
                <h3 className="font-bold text-lg mb-3">How to Get There</h3>

                {destination.transportOptions && destination.transportOptions.length > 0 ? (
                  <div className="space-y-3">
                    {destination.transportOptions.map((opt, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 flex items-start gap-3"
                      >
                        <div className="p-2.5 rounded-xl bg-[#FFD300]/20 text-[#090C11] dark:text-[#FFD300]">
                          <Bus size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-sm">{opt.type}</h4>
                            {opt.estimatedCost && (
                              <span className="text-xs font-bold text-accent-ink">
                                {opt.estimatedCost}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted dark:text-white/70">
                            {opt.description}
                          </p>
                          {opt.duration && (
                            <span className="text-[11px] text-muted block mt-1">
                              Travel Time: ~{opt.duration}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">
                    Direct bus and trotro services are available from regional capitals. Check our transportation guide for routes.
                  </p>
                )}

                <div className="pt-4">
                  <ButtonLink to="/transportation" variant="outline" size="sm">
                      Open Full Ghana Transportation Guide
                    </ButtonLink>
                </div>
              </div>
            )}

            {/* Tab: Safety */}
            {activeTab === 'safety' && (
              <div className="space-y-6">
                <h3 className="font-bold text-lg mb-3">Travel Tips & Safety Advisories</h3>
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-sm text-blue-900 dark:text-blue-200">
                    <ShieldAlert size={16} />
                    <span>General Safety Advice</span>
                  </div>
                  <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                    {destination.safetyInfo ||
                      'Ghana is widely recognized as one of the safest travel destinations in Africa. Carry bottled water, dress comfortably for tropical heat, and always respect local traditions and royal sites.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Action / Booking Box */}
          <div className="space-y-6">
            <div className="sticky top-28 p-6 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-xl space-y-5">
              <div>
                <span className="text-xs uppercase tracking-wider text-muted block mb-1">
                  Estimated Trip Cost
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[#090C11] dark:text-white">
                    {formatCurrency(destination.estimatedCostPerPerson || 0)}
                  </span>
                  <span className="text-xs text-muted">/ traveler</span>
                </div>
              </div>

              {destination.entryFee !== undefined && (
                <div className="flex items-center justify-between text-xs py-2 border-y border-gray-100 dark:border-white/10">
                  <span className="text-muted">Entry fee (last recorded):</span>
                  <span className="font-bold text-[#090C11] dark:text-white">
                    {destination.entryFee === 0 ? 'Free' : formatCurrency(destination.entryFee)}
                  </span>
                </div>
              )}

              <div className="space-y-2.5">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => navigate(`/planner?destination=${destination.name}`)}
                  className="font-bold"
                >
                  <Sparkles size={16} />
                  <span>Plan Trip to {destination.name}</span>
                </Button>

                <Button
                  variant="outline"
                  fullWidth
                  onClick={handleSave}
                >
                  <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} className={isSaved ? 'text-rose-500' : ''} />
                  <span>{isSaved ? 'Saved to Favorites' : 'Save Destination'}</span>
                </Button>
              </div>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-muted dark:text-white/50">
                  Fees and opening hours can change. Check with the site before you travel.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <FeedbackDialog subjectType="destination" subjectId={destination.id} subjectName={destination.name} />
        </div>

        {/* Nearby Destinations */}
        {nearbyItems.length > 0 && (
          <div className="mt-20 pt-10 border-t border-gray-200 dark:border-white/10">
            <h3 className="font-['Playfair_Display',serif] text-2xl font-bold mb-6">
              Nearby Attractions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyItems.map((item) => (
                <DestinationCard key={item.id} destination={item} />
              ))}
            </div>
          </div>
        )}

        {/* Festivals in this region */}
        <RegionFestivals regionName={destination.region} />
      </div>
    </div>
  );
};

export default DestinationDetailPage;
