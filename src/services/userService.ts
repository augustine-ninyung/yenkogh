import type { User, UserPreferences } from '@/types';
import { authService, profileToUser, type ProfileRow } from '@/services/authService';
import { supabase } from '@/lib/supabase';
import { prepareAvatar } from '@/utils/avatarImage';

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

// ─── Profile photos ───────────────────────────────────────────────────────────
// Stored in the "avatars" bucket under the owner's id. The storage rules only
// let a person write inside their own folder, and the database only accepts a
// profile photo address that points into that folder.

const AVATAR_BUCKET = 'avatars';

/** The storage path of a photo in this person's avatar folder, or null for anything else. */
function ownAvatarPath(userId: string, url: string | undefined): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${AVATAR_BUCKET}/`;
  const at = url.indexOf(marker);
  if (at < 0) return null;
  const path = decodeURIComponent(url.slice(at + marker.length).split('?')[0]);
  return path.startsWith(`${userId}/`) && !path.includes('..') ? path : null;
}

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('The photo could not be read.'));
    reader.readAsDataURL(blob);
  });

/** Removes every photo in this person's avatar folder. Never throws. */
export async function removeAllAvatars(userId: string): Promise<void> {
  if (!supabase) return;
  try {
    const { data } = await supabase.storage.from(AVATAR_BUCKET).list(userId, { limit: 100 });
    const paths = (data ?? []).map((f) => `${userId}/${f.name}`);
    if (paths.length) await supabase.storage.from(AVATAR_BUCKET).remove(paths);
  } catch {
    // A leftover file is not worth failing the caller over
  }
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

  /**
   * Sets a new profile photo from a file the person picked. The photo is
   * cropped and re-encoded on their device first (see prepareAvatar).
   */
  async uploadAvatar(user: User, file: File): Promise<User> {
    const blob = await prepareAvatar(file);
    if (!supabase) {
      await delay(300);
      return saveLocal({ ...localUser(user.id), avatar: await blobToDataUrl(blob) });
    }
    const extension = blob.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${user.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
    const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, blob, { contentType: blob.type, upsert: false });
    if (error) throw new Error('The photo could not be uploaded. Please try again.', { cause: error });
    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
    const updated = await patchRemote(user.id, { avatar: data.publicUrl });
    const previous = ownAvatarPath(user.id, user.avatar);
    if (previous) await supabase.storage.from(AVATAR_BUCKET).remove([previous]);
    return updated;
  },

  /** Removes the profile photo; the initials show instead. */
  async removeAvatar(user: User): Promise<User> {
    if (!supabase) {
      await delay(200);
      const { avatar: _removed, ...rest } = localUser(user.id);
      void _removed;
      return saveLocal(rest);
    }
    const { data, error } = await supabase.from('profiles').update({ avatar: null }).eq('id', user.id).select('*').single();
    if (error) throw new Error('The photo could not be removed. Please try again.', { cause: error });
    await removeAllAvatars(user.id);
    return profileToUser(data as ProfileRow);
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
