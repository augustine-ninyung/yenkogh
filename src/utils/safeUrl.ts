// ─── safeUrl ──────────────────────────────────────────────────────────────────
// Links built from database content (websites, sources, photo credits) go
// through this before reaching an href. React does not block `javascript:`
// URLs, so a bad value saved by an admin, or written straight to the database,
// could otherwise run script when a visitor clicks it.

/** The URL if it is an absolute http(s) link, otherwise undefined. */
export function safeUrl(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : undefined;
  } catch {
    return undefined;
  }
}
