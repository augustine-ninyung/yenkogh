import React, { useCallback, useReducer, useRef } from 'react';
import { ToastContext, type ToastData } from './useToast';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ToastState {
  toasts: ToastData[];
}

type ToastAction =
  | { type: 'ADD'; toast: ToastData }
  | { type: 'REMOVE'; id: string };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'ADD':
      return { toasts: [...state.toasts, action.toast] };
    case 'REMOVE':
      return { toasts: state.toasts.filter((t) => t.id !== action.id) };
    default:
      return state;
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });
  const counterRef = useRef(0);

  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  const addToast = useCallback(
    (options: Omit<ToastData, 'id'>): string => {
      counterRef.current += 1;
      const id = `toast-${Date.now()}-${counterRef.current}`;
      const toast: ToastData = { duration: 4000, ...options, id };
      dispatch({ type: 'ADD', toast });
      if (toast.duration && toast.duration > 0) {
        setTimeout(() => dispatch({ type: 'REMOVE', id }), toast.duration);
      }
      return id;
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toasts: state.toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};


export default ToastProvider;
