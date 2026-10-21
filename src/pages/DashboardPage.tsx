import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { useFavorites } from '@/context/useFavorites';
import { useDestinations } from '@/hooks/useDestinations';
import { useUpcomingEvents } from '@/hooks/useEvents';
import { tripService } from '@/services/tripService';
import { budgetService } from '@/services/budgetService';
import { DestinationCard } from '@/components/cards/DestinationCard';
import { EventCard } from '@/components/cards/EventCard';
import { TripCard } from '@/components/cards/TripCard';
import { BudgetCard } from '@/components/cards/BudgetCard';
import { ButtonLink } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import type { Trip, Budget } from '@/types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { savedDestinations, savedEvents } = useFavorites();
  const { destinations } = useDestinations();
  const { events } = useUpcomingEvents();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    if (user?.id) {
      tripService.getAll(user.id).then(setTrips);
      budgetService.getAll(user.id).then(setBudgets);
    }
  }, [user?.id]);

  const savedDestinationItems = destinations.filter((d) =>
    savedDestinations.includes(d.id)
  );

  const recommendedItems = destinations.slice(0, 3);

  const handleDeleteTrip = async (id: string) => {
    await tripService.delete(id);
    setTrips(trips.filter((t) => t.id !== id));
  };

  const handleDeleteBudget = async (id: string) => {
    await budgetService.delete(id);
    setBudgets(budgets.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-10">
      <PageHeader
        variant="inline"
        title={`${greeting}, ${user?.name?.split(' ')[0] || 'traveller'}`}
        description="Your trips, saved places and budgets in one place."
        actions={
          <>
            <ButtonLink to="/planner" variant="primary" size="sm">Plan a trip</ButtonLink>
            <ButtonLink to="/explore" variant="outline" size="sm">Browse destinations</ButtonLink>
          </>
        }
      />

      {/* Quick Stat Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm">
          <span className="text-sm text-muted block mb-1">
            Trips
          </span>
          <span className="text-2xl sm:text-3xl font-semibold text-[#090C11] dark:text-white">
            {trips.length}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm">
          <span className="text-sm text-muted block mb-1">
            Saved places
          </span>
          <span className="text-2xl sm:text-3xl font-semibold text-[#090C11] dark:text-white">
            {savedDestinations.length}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm">
          <span className="text-sm text-muted block mb-1">
            Saved festivals
          </span>
          <span className="text-2xl sm:text-3xl font-semibold text-[#090C11] dark:text-white">
            {savedEvents.length}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm">
          <span className="text-sm text-muted block mb-1">
            Budgets
          </span>
          <span className="text-2xl sm:text-3xl font-semibold text-[#090C11] dark:text-white">
            {budgets.length}
          </span>
        </div>
      </div>

      {/* Planned Trips Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Your trips</h2>
          </div>
          <ButtonLink to="/planner" variant="outline" size="sm" className="gap-1.5">
              <Plus size={14} />
              <span>New trip</span>
            </ButtonLink>
        </div>

        {trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onDelete={handleDeleteTrip} />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white dark:bg-[#262B32] border border-dashed border-gray-200 dark:border-white/10 text-center space-y-3">
            <Compass size={28} className="text-[#FFD300] mx-auto" />
            <h3 className="font-semibold text-base">No trips yet</h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Describe a trip in a sentence, or pick places and dates, and the planner builds a day-by-day plan you can save here.
            </p>
            <ButtonLink to="/planner" variant="primary" size="sm">
                Plan your first trip
              </ButtonLink>
          </div>
        )}
      </div>

      {/* Active Travel Budgets */}
      {budgets.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your budgets</h2>
            <Link to="/budget" className="text-xs text-accent-ink hover:underline font-semibold">
              Manage Budgets
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((b) => (
              <BudgetCard key={b.id} budget={b} onDelete={handleDeleteBudget} />
            ))}
          </div>
        </div>
      )}

      {/* Saved Places Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Saved places</h2>
          </div>
          <Link to="/explore" className="text-xs text-accent-ink hover:underline font-semibold">
            Browse more places
          </Link>
        </div>

        {savedDestinationItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedDestinationItems.slice(0, 3).map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 text-center text-xs text-muted">
            You haven't saved any destinations yet. Click the heart icon on any destination card to save it here!
          </div>
        )}
      </div>

      {/* Recommended for You */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Featured destinations</h2>
          </div>
          <Link to="/explore" className="text-xs text-accent-ink hover:underline font-semibold flex items-center gap-1">
            <span>See all</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedItems.map((dest) => (
            <DestinationCard key={dest.id} destination={dest} />
          ))}
        </div>
      </div>

      {/* Upcoming Festivals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Upcoming festivals</h2>
          </div>
          <Link to="/events" className="text-xs text-accent-ink hover:underline font-semibold flex items-center gap-1">
            <span>View festival calendar</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.slice(0, 3).map((evt) => (
            <EventCard key={evt.id} event={evt} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
