import { createContext, useContext } from 'react';

// The toast context, its types and its hook. The provider is in ToastContext.tsx.

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  duration?: number; // ms, 0 = persist
}

export interface ToastContextValue {
  toasts: ToastData[];
  addToast: (options: Omit<ToastData, 'id'>) => string;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }
  return ctx;
}
