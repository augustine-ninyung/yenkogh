// ─── contactLinks ─────────────────────────────────────────────────────────────
// Phone and email links built from database content. Only values that look like
// a phone number or an email address become links, so a bad value cannot turn
// into anything else (the same reason other links go through safeUrl).

/** A tel: link for a phone number, or undefined if it does not look like one. */
export function telLink(phone: string | undefined): string | undefined {
  const value = phone?.trim();
  if (!value || !/^\+?[0-9][0-9 ()-]{6,20}$/.test(value)) return undefined;
  return `tel:${value.replace(/[ ()-]/g, '')}`;
}

/** A mailto: link for an email address, or undefined if it does not look like one. */
export function mailLink(email: string | undefined): string | undefined {
  const value = email?.trim();
  if (!value || value.length > 160 || !/^[^\s@<>"'?&]+@[^\s@<>"'?&]+\.[a-z]{2,}$/i.test(value)) return undefined;
  return `mailto:${value}`;
}
