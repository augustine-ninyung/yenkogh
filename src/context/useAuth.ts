import { createContext, useContext } from 'react';
import type { User, AuthState } from '@/types';

// The auth context and its hook. The provider is in AuthContext.tsx; keeping
// them apart lets the dev server hot-reload that file without losing state.

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
