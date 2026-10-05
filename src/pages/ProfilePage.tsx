import React, { useState } from 'react';
import {
  Save,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useDestinations } from '@/hooks/useDestinations';
import { useEvents } from '@/hooks/useEvents';
import { userService } from '@/services/userService';
import { useToast } from '@/context/ToastContext';
import { Avatar } from '@/components/ui/Avatar';
import { DestinationCard } from '@/components/cards/DestinationCard';
import { EventCard } from '@/components/cards/EventCard';
import { Button } from '@/components/ui/Button';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { savedDestinations, savedEvents } = useFavorites();
  const { destinations } = useDestinations();
  const { events } = useEvents();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'saved-places' | 'saved-events'>('profile');

  // Edit State
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || 'Passionate traveler exploring the culture and natural heritage of Ghana.');
  const [currency, setCurrency] = useState(user?.preferences?.currency || 'GHS');
  const [notifications, setNotifications] = useState(user?.preferences?.notifications ?? true);
  const [isSaving, setIsSaving] = useState(false);

  const savedDestList = destinations.filter((d) => savedDestinations.includes(d.id));
  const savedEventList = events.filter((e) => savedEvents.includes(e.id));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const updated = await userService.updateProfile(user.id, {
        name,
        bio,
        preferences: {
          ...user.preferences,
          currency,
          notifications,
        },
      });

      updateUser(updated);
      addToast({
        variant: 'success',
        title: 'Profile Updated',
        message: 'Your traveler profile changes have been saved.',
      });
    } catch {
      addToast({
        variant: 'error',
        title: 'Update Failed',
        message: 'Could not update profile. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Avatar */}
      <div className="p-8 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <Avatar src={user?.avatar} name={user?.name || 'Traveler'} size="xl" />

        <div className="text-center sm:text-left flex-1 space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-bold text-[#090C11] dark:text-white">
              {user?.name || 'Ghana Traveler'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-[#FFD300]/20 text-[#090C11] dark:text-[#FFD300]">
              {user?.role || 'User'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#757B81]">{user?.email}</p>
          <p className="text-xs text-[#757B81] pt-1">
            Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : 2026}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-white/10 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'profile'
              ? 'text-[#090C11] dark:text-white border-b-2 border-[#FFD300]'
              : 'text-[#757B81]'
          }`}
        >
          Profile Settings
        </button>
        <button
          onClick={() => setActiveTab('saved-places')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'saved-places'
              ? 'text-[#090C11] dark:text-white border-b-2 border-[#FFD300]'
              : 'text-[#757B81]'
          }`}
        >
          Saved Places ({savedDestinations.length})
        </button>
        <button
          onClick={() => setActiveTab('saved-events')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'saved-events'
              ? 'text-[#090C11] dark:text-white border-b-2 border-[#FFD300]'
              : 'text-[#757B81]'
          }`}
        >
          Saved Festivals ({savedEvents.length})
        </button>
      </div>

      {/* Tab: Profile Edit */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="p-8 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm space-y-6 max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#757B81] block mb-1.5 uppercase">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11] text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD300]"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#757B81] block mb-1.5 uppercase">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-sm opacity-60 cursor-not-allowed"
              />
              <span className="text-[11px] text-[#757B81]">Email cannot be changed directly</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#757B81] block mb-1.5 uppercase">
                Bio / Travel Style
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11] text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD300]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-[#757B81] block mb-1.5 uppercase">
                  Preferred Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11] text-sm"
                >
                  <option value="GHS">Ghana Cedi (GH₵)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FFD300] focus:ring-[#FFD300]"
                />
                <label htmlFor="notifications" className="text-xs font-medium cursor-pointer">
                  Email updates on festivals & new attractions
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex justify-end">
            <Button type="submit" variant="primary" isLoading={isSaving} className="font-bold">
              <Save size={16} />
              <span>Save Profile Changes</span>
            </Button>
          </div>
        </form>
      )}

      {/* Tab: Saved Places */}
      {activeTab === 'saved-places' && (
        <div className="space-y-4">
          {savedDestList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedDestList.map((d) => (
                <DestinationCard key={d.id} destination={d} />
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 text-center text-xs text-[#757B81]">
              No saved destinations yet. Explore Ghana's attractions to add some!
            </div>
          )}
        </div>
      )}

      {/* Tab: Saved Events */}
      {activeTab === 'saved-events' && (
        <div className="space-y-4">
          {savedEventList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedEventList.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 text-center text-xs text-[#757B81]">
              No saved festivals yet. Explore upcoming cultural celebrations to add some!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
