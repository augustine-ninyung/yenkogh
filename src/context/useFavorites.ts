import { createContext, useContext } from 'react';

// The saved-places context and its hook. The provider is in FavoritesContext.tsx.

export interface FavoritesContextType {
  savedDestinations: string[];
  savedEvents: string[];
  toggleDestination: (id: string) => void;
  toggleEvent: (id: string) => void;
  isDestinationSaved: (id: string) => boolean;
  isEventSaved: (id: string) => boolean;
}

export const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function useFavorites(): FavoritesContextType {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
