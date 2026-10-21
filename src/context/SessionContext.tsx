import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useToast } from './useToast';
import { SessionContext, IDLE_MS, WARNING_MS } from './useSession';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

// ─── SessionProvider ──────────────────────────────────────────────────────────
// Two things about staying signed in:
//  - Signing out always asks first ("Sign out?").
//  - After IDLE_MS without any activity a warning appears with a countdown.
//    "Continue session" keeps the person signed in; otherwise they are signed
//    out when it reaches zero. Activity in any open tab counts, through a
//    shared timestamp in localStorage, and a device that slept past the limit
//    signs out as soon as it wakes.

const ACTIVITY_KEY = 'yenkogh_last_activity';
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'wheel'] as const;
const WRITE_EVERY_MS = 5000;

const readLastActivity = (): number => {
  try {
    return Number(localStorage.getItem(ACTIVITY_KEY)) || 0;
  } catch {
    return 0;
  }
};

const writeLastActivity = (at: number) => {
  try {
    localStorage.setItem(ACTIVITY_KEY, String(at));
  } catch {
    // Storage can be unavailable; this tab still keeps its own time
  }
};

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [leaving, setLeaving] = useState(false);
  const leavingRef = useRef(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const lastActivity = useRef(Date.now());
  const lastWrite = useRef(0);

  const signOut = useCallback(() => {
    setConfirmOpen(false);
    setSecondsLeft(null);
    try {
      localStorage.removeItem(ACTIVITY_KEY);
    } catch {
      // Nothing to clear
    }
    // Leave members-only pages first and sign out once home has loaded (below);
    // signing out straight away would let their guard redirect to sign-in instead.
    leavingRef.current = true;
    setLeaving(true);
    navigate('/', { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (leaving && pathname === '/') {
      leavingRef.current = false;
      setLeaving(false);
      logout();
    }
  }, [leaving, pathname, logout]);

  const markActive = useCallback((force = false) => {
    const now = Date.now();
    lastActivity.current = now;
    if (force || now - lastWrite.current > WRITE_EVERY_MS) {
      lastWrite.current = now;
      writeLastActivity(now);
    }
  }, []);

  // Record activity while signed in. While the warning is showing, only the
  // "Continue session" button keeps the session.
  const warning = secondsLeft !== null;
  useEffect(() => {
    if (!isAuthenticated || warning) return;
    const onActivity = () => markActive();
    for (const e of ACTIVITY_EVENTS) window.addEventListener(e, onActivity, { passive: true });
    return () => {
      for (const e of ACTIVITY_EVENTS) window.removeEventListener(e, onActivity);
    };
  }, [isAuthenticated, warning, markActive]);

  // Start each signed-in session fresh
  useEffect(() => {
    if (isAuthenticated) markActive(true);
    else setSecondsLeft(null);
  }, [isAuthenticated, markActive]);

  // Check once a second how long it has been, counting other tabs' activity too
  useEffect(() => {
    if (!isAuthenticated) return;
    const tick = () => {
      if (leavingRef.current) return; // already signing out
      const last = Math.max(lastActivity.current, readLastActivity());
      const idle = Date.now() - last;
      if (idle >= IDLE_MS + WARNING_MS) {
        signOut();
        addToast({
          variant: 'info',
          title: 'Signed out',
          message: 'You were signed out after 10 minutes without activity.',
          duration: 0,
        });
      } else if (idle >= IDLE_MS) {
        setSecondsLeft(Math.ceil((IDLE_MS + WARNING_MS - idle) / 1000));
      } else {
        setSecondsLeft(null);
      }
    };
    const timer = window.setInterval(tick, 1000);
    // Coming back to a tab (or waking a device) is checked straight away
    const onVisible = () => document.visibilityState === 'visible' && tick();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [isAuthenticated, signOut, addToast]);

  const continueSession = useCallback(() => {
    markActive(true);
    setSecondsLeft(null);
  }, [markActive]);

  const value = useMemo(() => ({ requestSignOut: () => setConfirmOpen(true) }), []);

  return (
    <SessionContext.Provider value={value}>
      {children}

      <ConfirmDialog
        isOpen={confirmOpen && !warning}
        title="Sign out?"
        message="You will need to sign in again to see your trips, saved places and budgets."
        confirmLabel="Sign out"
        onConfirm={signOut}
        onCancel={() => setConfirmOpen(false)}
      />

      <Modal isOpen={isAuthenticated && warning} onClose={continueSession} title="Are you still there?" size="sm">
        <div className="space-y-5">
          <p className="text-sm text-muted dark:text-white/80">
            You have been inactive for 10 minutes. For your security, you will be signed out in{' '}
            <strong className="tabular-nums text-[#090C11] dark:text-white" role="timer">
              {secondsLeft} {secondsLeft === 1 ? 'second' : 'seconds'}
            </strong>
            .
          </p>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <Button variant="ghost" onClick={signOut}>
              Sign out now
            </Button>
            <Button variant="primary" onClick={continueSession}>
              Continue session
            </Button>
          </div>
        </div>
      </Modal>
    </SessionContext.Provider>
  );
}

export default SessionProvider;
