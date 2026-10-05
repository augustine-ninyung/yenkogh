import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/userService';

interface FavoritesState {
  savedDestinations: string[];
  savedEvents: string[];
}

interface FavoritesContextType {
  savedDestinations: string[];
  savedEvents: string[];
  toggleDestination: (id: string) => void;
  toggleEvent: (id: string) => void;
  isDestinationSaved: (id: string) => boolean;
  isEventSaved: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

const STORAGE_KEY = 'yenkogh_favorites';

function readFromStorage(): FavoritesState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<FavoritesState>;
      return {
        savedDestinations: Array.isArray(parsed.savedDestinations) ? parsed.savedDestinations : [],
        savedEvents: Array.isArray(parsed.savedEvents) ? parsed.savedEvents : [],
      };
    }
  } catch {
    // ignore parse errors
  }
  return { savedDestinations: [], savedEvents: [] };
}

function writeToStorage(state: FavoritesState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore write errors
  }
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [state, setState] = useState<FavoritesState>(() => {
    // If the user is already loaded from authService, seed from their profile;
    // otherwise fall back to localStorage.
    if (user) {
      return {
        savedDestinations: user.savedDestinations ?? [],
        savedEvents: user.savedEvents ?? [],
      };
    }
    return readFromStorage();
  });

  // Set while the favourites on screen still belong to the previous person (or to nobody),
  // so they are never written onto the account that has just signed in.
  const awaitingSeed = useRef(true);

  // Re-seed from the user profile whenever auth state changes (login / logout).
  useEffect(() => {
    awaitingSeed.current = true;
    if (user) {
      setState({
        savedDestinations: user.savedDestinations ?? [],
        savedEvents: user.savedEvents ?? [],
      });
    } else {
      // User logged out — clear to localStorage defaults.
      setState(readFromStorage());
    }
  }, [user?.id]); // only re-run when the user identity changes

  // Persist to localStorage on every state change.
  useEffect(() => {
    writeToStorage(state);
  }, [state]);

  // Save a signed-in person's favourites to their profile.
  useEffect(() => {
    if (awaitingSeed.current) {
      awaitingSeed.current = false;
      return;
    }
    if (!user) return;
    userService.saveFavorites(user.id, state).catch(() => {
      // The local copy is still intact; the next change will try again
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs on favourites changes only
  }, [state]);

  const toggleDestination = useCallback((id: string) => {
    setState((prev) => {
      const exists = prev.savedDestinations.includes(id);
      return {
        ...prev,
        savedDestinations: exists
          ? prev.savedDestinations.filter((d) => d !== id)
          : [...prev.savedDestinations, id],
      };
    });
  }, []);

  const toggleEvent = useCallback((id: string) => {
    setState((prev) => {
      const exists = prev.savedEvents.includes(id);
      return {
        ...prev,
        savedEvents: exists
          ? prev.savedEvents.filter((e) => e !== id)
          : [...prev.savedEvents, id],
      };
    });
  }, []);

  const isDestinationSaved = useCallback(
    (id: string) => state.savedDestinations.includes(id),
    [state.savedDestinations],
  );

  const isEventSaved = useCallback(
    (id: string) => state.savedEvents.includes(id),
    [state.savedEvents],
  );

  return (
    <FavoritesContext.Provider
      value={{
        savedDestinations: state.savedDestinations,
        savedEvents: state.savedEvents,
        toggleDestination,
        toggleEvent,
        isDestinationSaved,
        isEventSaved,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextType {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
