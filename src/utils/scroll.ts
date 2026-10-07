// Height of the fixed navbar, so a section scrolled to is not hidden beneath it
export const NAVBAR_OFFSET = 88;

/** Scrolls so `element` sits just below the navbar. Used when a list changes page. */
export function scrollToStart(element: HTMLElement | null): void {
  if (!element) return;
  // Wait for the new page of results to render, so the jump is not interrupted by the layout change
  requestAnimationFrame(() => {
    const top = element.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;
    // Only move when the start has scrolled out of view above
    if (top < window.scrollY) window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
  });
}
