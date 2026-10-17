import React from 'react';

// ─── SkipLink ─────────────────────────────────────────────────────────────────
// First stop for keyboard users: jumps past the navigation to <main id="main">.
// Hidden until it receives focus.

export const SkipLink: React.FC = () => (
  <a
    href="#main"
    className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-[#FFD300] focus:text-[#090C11] focus:font-semibold focus:shadow-lg"
  >
    Skip to content
  </a>
);

export default SkipLink;
