// ─── pageView ─────────────────────────────────────────────────────────────────
// Pure helpers for the anonymous traffic counter. They turn what the browser
// knows into the three coarse values the database accepts, so nothing more
// specific (an exact address, a full referring URL) ever leaves the page.

/** Page types the database accepts; keep in step with record_page_view in admin.sql. */
export const PAGE_PATHS = [
  '/', '/explore', '/explore/:id', '/events', '/events/:id', '/festivals/:id',
  '/transportation', '/planner', '/budget', '/login', '/register',
  '/forgot-password', '/reset-password', '/privacy', '/terms', '/cookies',
  '/credits', '/dashboard', '/dashboard/trips', '/dashboard/saved',
  '/dashboard/budget', '/dashboard/profile', '/dashboard/settings', '/profile',
] as const;

const DETAIL = [
  [/^\/explore\/[^/]+\/?$/, '/explore/:id'],
  [/^\/events\/[^/]+\/?$/, '/events/:id'],
  [/^\/festivals\/[^/]+\/?$/, '/festivals/:id'],
] as const;

/**
 * The page type for an address: '/explore/kakum' becomes '/explore/:id'.
 * Returns null for pages that are not counted (the admin area) and
 * '(not found)' for addresses the site does not have.
 */
export function pageViewPath(pathname: string): string | null {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/admin' || path.startsWith('/admin/')) return null;
  if ((PAGE_PATHS as readonly string[]).includes(path)) return path;
  for (const [pattern, type] of DETAIL) if (pattern.test(path)) return type;
  return '(not found)';
}

/** Screen size class, from the viewport width alone (no browser fingerprinting). */
export function deviceClass(viewportWidth: number): 'mobile' | 'tablet' | 'desktop' {
  if (viewportWidth < 640) return 'mobile';
  if (viewportWidth < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Where a visit came from, for its first page: the referring site's domain
 * (without "www."), or 'direct'. Links from this site itself count as direct.
 */
export function referrerSource(referrer: string, ownHost: string): string {
  if (!referrer) return 'direct';
  try {
    const host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, '');
    if (!host || host === ownHost.toLowerCase().replace(/^www\./, '')) return 'direct';
    return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(host) && host.length <= 60 ? host : 'other';
  } catch {
    return 'direct';
  }
}

/** True when the browser asks not to be tracked (Global Privacy Control or Do Not Track). */
export function prefersNoTracking(nav: Navigator & { globalPrivacyControl?: boolean }): boolean {
  return nav.globalPrivacyControl === true || nav.doNotTrack === '1';
}
