import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Calendar,
  Heart,
  MapPin,
  Wallet,
  Sparkles,
  ArrowRight,
  Plus,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useDestinations } from '@/hooks/useDestinations';
import { useUpcomingEvents } from '@/hooks/useEvents';
import { tripService } from '@/services/tripService';
import { budgetService } from '@/services/budgetService';
import { DestinationCard } from '@/components/cards/DestinationCard';
import { EventCard } from '@/components/cards/EventCard';
import { TripCard } from '@/components/cards/TripCard';
import { BudgetCard } from '@/components/cards/BudgetCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/formatters';
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
      {/* Personalized Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#262B32] to-[#090C11] text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#FFD300]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <Badge variant="primary" className="mb-3">
            Ghana Traveler Hub
          </Badge>
          <h1 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl font-bold mb-2">
            {greeting}, {user?.name || 'Traveler'} 👋
          </h1>
          <p className="text-white/70 text-sm sm:text-base mb-6">
            Where in Ghana will your next adventure take you? Explore coastal castles, hike misty waterfalls, or plan a custom journey in minutes.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/planner">
              <Button variant="primary" size="sm" className="font-bold">
                <Sparkles size={16} />
                <span>Create New Trip</span>
              </Button>
            </Link>
            <Link to="/explore">
              <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
                <Compass size={16} />
                <span>Discover Attractions</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stat Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm">
          <span className="text-xs text-[#757B81] uppercase font-semibold block mb-1">
            Planned Trips
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-[#090C11] dark:text-white">
            {trips.length}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm">
          <span className="text-xs text-[#757B81] uppercase font-semibold block mb-1">
            Saved Places
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-[#FFD300]">
            {savedDestinations.length}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm">
          <span className="text-xs text-[#757B81] uppercase font-semibold block mb-1">
            Saved Festivals
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-emerald-500">
            {savedEvents.length}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm">
          <span className="text-xs text-[#757B81] uppercase font-semibold block mb-1">
            Active Budgets
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-blue-500">
            {budgets.length}
          </span>
        </div>
      </div>

      {/* Planned Trips Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">My Planned Journeys</h2>
            <p className="text-xs text-[#757B81]">Your personalized Ghana travel plans</p>
          </div>
          <Link to="/planner">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Plus size={14} />
              <span>New Trip</span>
            </Button>
          </Link>
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
            <h3 className="font-semibold text-base">No Planned Trips Yet</h3>
            <p className="text-xs text-[#757B81] max-w-sm mx-auto">
              Ready to visit Cape Coast, Mole National Park, or Lake Volta? Use our AI Planner to generate your first itinerary in 30 seconds.
            </p>
            <Link to="/planner">
              <Button variant="primary" size="sm">
                Generate First Trip
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Active Travel Budgets */}
      {budgets.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">My Travel Budgets</h2>
            <Link to="/budget" className="text-xs text-[#FFD300] hover:underline font-semibold">
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
            <h2 className="text-xl font-bold">Saved Attractions</h2>
            <p className="text-xs text-[#757B81]">Places you've bookmarked for your visit</p>
          </div>
          <Link to="/explore" className="text-xs text-[#FFD300] hover:underline font-semibold">
            Browse More Places
          </Link>
        </div>

        {savedDestinationItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedDestinationItems.slice(0, 3).map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 text-center text-xs text-[#757B81]">
            You haven't saved any destinations yet. Click the heart icon on any destination card to save it here!
          </div>
        )}
      </div>

      {/* Recommended for You */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Recommended for You</h2>
            <p className="text-xs text-[#757B81]">Top attractions across Ghana</p>
          </div>
          <Link to="/explore" className="text-xs text-[#FFD300] hover:underline font-semibold flex items-center gap-1">
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
            <h2 className="text-xl font-bold">Upcoming Ghanaian Festivals</h2>
            <p className="text-xs text-[#757B81]">Don't miss these cultural spectacles</p>
          </div>
          <Link to="/events" className="text-xs text-[#FFD300] hover:underline font-semibold flex items-center gap-1">
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
