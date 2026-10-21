import { createContext, useContext } from 'react';

// The session context and its hook. The provider is in SessionContext.tsx.

/** Signed-in time without activity before the warning, and how long the warning lasts. */
export const IDLE_MS = 10 * 60 * 1000;
export const WARNING_MS = 60 * 1000;

export interface SessionContextValue {
  /** Asks "Sign out?" first, then signs out and returns to the home page. */
  requestSignOut: () => void;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
