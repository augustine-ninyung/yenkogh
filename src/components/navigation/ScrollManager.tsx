import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { NAVBAR_OFFSET } from '@/utils/scroll';

// ─── ScrollManager ────────────────────────────────────────────────────────────
// A single-page app keeps the scroll position when the route changes, so a link
// clicked far down one page would open the next page far down too. This starts
// every new page at its top, or at the section named in the address (#safety).

export function ScrollManager(): null {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // The section may render a moment after the route does
      const timer = setTimeout(() => {
        const section = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (section) {
          window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET, behavior: 'instant' });
        }
      }, 80);
      return () => clearTimeout(timer);
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return null;
}

export default ScrollManager;
