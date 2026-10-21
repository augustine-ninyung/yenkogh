import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { recordPageView } from '@/services/viewService';
import { deviceClass, pageViewPath, prefersNoTracking, referrerSource } from '@/utils/pageView';

// ─── PageViewTracker ──────────────────────────────────────────────────────────
// Adds one to the anonymous daily traffic totals on each page change. The
// first page after the site loads records where the visit came from; later
// pages count as moves within the site. Browsers that ask not to be tracked
// are not counted at all.

export function PageViewTracker(): null {
  const { pathname } = useLocation();
  const last = useRef<string | null>(null);
  const isEntry = useRef(true);

  useEffect(() => {
    if (last.current === pathname) return; // React's development double-run, or a hash change
    last.current = pathname;
    const path = pageViewPath(pathname);
    const entry = isEntry.current;
    isEntry.current = false;
    if (!path || prefersNoTracking(navigator)) return;
    recordPageView(path, entry ? referrerSource(document.referrer, window.location.hostname) : 'internal', deviceClass(window.innerWidth));
  }, [pathname]);

  return null;
}

export default PageViewTracker;
