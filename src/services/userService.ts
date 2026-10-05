import type { User, UserPreferences } from '@/types';
import { authService, profileToUser, type ProfileRow } from '@/services/authService';
import { supabase } from '@/lib/supabase';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ─── Backend (Supabase) ───────────────────────────────────────────────────────

async function fetchRemote(userId: string): Promise<User | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? profileToUser(data as ProfileRow) : null;
}

/**
 * Writes the editable parts of a profile. Role, email and id are deliberately
 * left out: the database does not let a person change those on their own row.
 */
async function patchRemote(userId: string, updates: Partial<User>): Promise<User> {
  if (!supabase) throw new Error('Backend is not configured.');
  const row: Partial<ProfileRow> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.avatar !== undefined) row.avatar = updates.avatar;
  if (updates.bio !== undefined) row.bio = updates.bio;
  if (updates.preferences !== undefined) row.preferences = updates.preferences;
  if (updates.savedDestinations !== undefined) row.saved_destinations = updates.savedDestinations;
  if (updates.savedEvents !== undefined) row.saved_events = updates.savedEvents;

  const { data, error } = await supabase.from('profiles').update(row).eq('id', userId).select('*').single();
  if (error) throw new Error(error.message);
  return profileToUser(data as ProfileRow);
}

// ─── Local fallback ───────────────────────────────────────────────────────────

function localUser(userId: string): User {
  const current = authService.getCurrentUser();
  if (!current || current.id !== userId) throw new Error('User not found');
  return current;
}

function saveLocal(user: User): User {
  authService._updateCurrentUser(user);
  return user;
}

const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

// ─── User Service ─────────────────────────────────────────────────────────────

export const userService = {
  async getProfile(userId: string): Promise<User | null> {
    if (supabase) return fetchRemote(userId);
    await delay(200);
    const current = authService.getCurrentUser();
    if (current?.id === userId) return current;
    return null;
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    if (supabase) return patchRemote(userId, updates);
    await delay(500);
    return saveLocal({ ...localUser(userId), ...updates });
  },

  /** Stores the full lists of saved destinations and events on the profile. */
  async saveFavorites(userId: string, favorites: { savedDestinations: string[]; savedEvents: string[] }): Promise<User> {
    if (supabase) return patchRemote(userId, favorites);
    return saveLocal({ ...localUser(userId), ...favorites });
  },

  async toggleSavedDestination(userId: string, destinationId: string): Promise<User> {
    if (supabase) {
      const current = await fetchRemote(userId);
      if (!current) throw new Error('User not found');
      return patchRemote(userId, { savedDestinations: toggle(current.savedDestinations, destinationId) });
    }
    await delay(200);
    const current = localUser(userId);
    return saveLocal({ ...current, savedDestinations: toggle(current.savedDestinations, destinationId) });
  },

  async toggleSavedEvent(userId: string, eventId: string): Promise<User> {
    if (supabase) {
      const current = await fetchRemote(userId);
      if (!current) throw new Error('User not found');
      return patchRemote(userId, { savedEvents: toggle(current.savedEvents, eventId) });
    }
    await delay(200);
    const current = localUser(userId);
    return saveLocal({ ...current, savedEvents: toggle(current.savedEvents, eventId) });
  },

  async updatePreferences(userId: string, prefs: Partial<UserPreferences>): Promise<User> {
    if (supabase) {
      const current = await fetchRemote(userId);
      if (!current) throw new Error('User not found');
      return patchRemote(userId, { preferences: { ...current.preferences, ...prefs } });
    }
    await delay(300);
    const current = localUser(userId);
    return saveLocal({ ...current, preferences: { ...current.preferences, ...prefs } });
  },
};
