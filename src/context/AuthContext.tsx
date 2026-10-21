import React, { useEffect, useState, useCallback } from 'react';
import type { User } from '@/types';
import { AuthContext } from './useAuth';
import { authService } from '@/services/authService';
import { supabase, isBackendConfigured } from '@/lib/supabase';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());
  // With a backend the session is restored asynchronously, so routes wait for it
  const [isLoading, setIsLoading] = useState(isBackendConfigured);
  const [token, setToken] = useState<string | null>(() => authService.getToken());

  // Backend: restore the session on load, and follow sign-outs and token refreshes
  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    authService
      .restoreSession()
      .then((session) => {
        if (cancelled) return;
        setUser(session?.user ?? null);
        setToken(session?.token ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
        setToken(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setToken(null);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setToken(session.access_token);
      }
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const loggedInUser = await authService.login(email, password);
      setUser(loggedInUser);
      setToken(isBackendConfigured ? await authService.getSessionToken() : authService.getToken());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const newUser = await authService.register(name, email, password);
      setUser(newUser);
      setToken(isBackendConfigured ? await authService.getSessionToken() : authService.getToken());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  const deleteAccount = useCallback(async () => {
    await authService.deleteAccount();
    setUser(null);
    setToken(null);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    authService._updateCurrentUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!token && !!user,
        isLoading,
        token,
        login,
        register,
        logout,
        deleteAccount,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
