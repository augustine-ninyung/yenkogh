/**
 * Format a GHS monetary amount with the cedis symbol.
 * Example: formatCurrency(1234) → "₵1,234.00"
 */
export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `₵${formatted}`;
}

/**
 * Format an ISO date string to a long human-readable date.
 * Example: formatDate("2026-10-15") → "October 15, 2026"
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format an ISO date string to a short month-day representation.
 * Example: formatDateShort("2026-10-15") → "Oct 15"
 */
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GH', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a start/end ISO date range into a compact string.
 * Same month & year: "Oct 15 – 18, 2026"
 * Same year only:   "Oct 15 – Nov 3, 2026"
 * Different years:  "Dec 28, 2025 – Jan 2, 2026"
 */
export function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const sYear = startDate.getFullYear();
  const eYear = endDate.getFullYear();
  const sMonth = startDate.getMonth();
  const eMonth = endDate.getMonth();

  const dayFmt = (d: Date) =>
    d.toLocaleDateString('en-GH', { month: 'short', day: 'numeric' });

  if (sYear === eYear && sMonth === eMonth) {
    // Same month — share month and year
    const startMonthDay = startDate.toLocaleDateString('en-GH', {
      month: 'short',
      day: 'numeric',
    });
    const endDay = endDate.getDate();
    return `${startMonthDay} – ${endDay}, ${sYear}`;
  }

  if (sYear === eYear) {
    // Same year, different months
    return `${dayFmt(startDate)} – ${dayFmt(endDate)}, ${sYear}`;
  }

  // Different years
  return `${formatDate(start)} – ${formatDate(end)}`;
}

/**
 * Convert a duration in minutes to a human-readable string.
 * Example: formatDuration(150) → "2h 30m"
 * Example: formatDuration(45)  → "45m"
 * Example: formatDuration(120) → "2h"
 */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Format a numeric rating to one decimal place.
 * Example: formatRating(4.5) → "4.5"
 * Example: formatRating(5)   → "5.0"
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/**
 * Truncate text to a maximum character length, appending "…" if truncated.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

/**
 * Convert a string to a URL-safe slug.
 * Example: slugify("Cape Coast Castle") → "cape-coast-castle"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // remove non-word characters (except hyphens)
    .replace(/[\s_]+/g, '-')    // replace spaces and underscores with hyphens
    .replace(/--+/g, '-')       // collapse consecutive hyphens
    .replace(/^-+|-+$/g, '');   // strip leading/trailing hyphens
}

/**
 * Capitalize the first letter of each word in a string.
 * Example: capitalize("cape coast") → "Cape Coast"
 */
export function capitalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (char) => char.toUpperCase());
}

/**
 * Format a number with thousands separators.
 * Example: formatNumber(1234567) → "1,234,567"
 */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-GH').format(n);
}
