import type { User, UserPreferences } from '@/types';
import { authService } from '@/services/authService';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const userService = {
  async getProfile(userId: string): Promise<User | null> {
    await delay(200);
    const current = authService.getCurrentUser();
    if (current?.id === userId) return current;
    return null;
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    await delay(500);
    const current = authService.getCurrentUser();
    if (!current || current.id !== userId) throw new Error('User not found');
    const updated: User = { ...current, ...updates };
    authService._updateCurrentUser(updated);
    return updated;
  },

  async toggleSavedDestination(userId: string, destinationId: string): Promise<User> {
    await delay(200);
    const current = authService.getCurrentUser();
    if (!current || current.id !== userId) throw new Error('User not found');
    const saved = current.savedDestinations.includes(destinationId)
      ? current.savedDestinations.filter((id) => id !== destinationId)
      : [...current.savedDestinations, destinationId];
    const updated: User = { ...current, savedDestinations: saved };
    authService._updateCurrentUser(updated);
    return updated;
  },

  async toggleSavedEvent(userId: string, eventId: string): Promise<User> {
    await delay(200);
    const current = authService.getCurrentUser();
    if (!current || current.id !== userId) throw new Error('User not found');
    const saved = current.savedEvents.includes(eventId)
      ? current.savedEvents.filter((id) => id !== eventId)
      : [...current.savedEvents, eventId];
    const updated: User = { ...current, savedEvents: saved };
    authService._updateCurrentUser(updated);
    return updated;
  },

  async updatePreferences(userId: string, prefs: Partial<UserPreferences>): Promise<User> {
    await delay(300);
    const current = authService.getCurrentUser();
    if (!current || current.id !== userId) throw new Error('User not found');
    const updated: User = {
      ...current,
      preferences: { ...current.preferences, ...prefs },
    };
    authService._updateCurrentUser(updated);
    return updated;
  },
};
