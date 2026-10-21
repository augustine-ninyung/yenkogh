// ─── Site & operator details ──────────────────────────────────────────────────
// The single source for who runs YɛnkɔGH and how to reach them. The footer and
// the legal pages read from here, so keep these accurate before going public.
// Leave a field empty rather than inventing a value: empty fields are hidden.

export const SITE = {
  name: 'YɛnkɔGH',
  /** The person or organisation legally responsible for the site */
  operator: 'Augustine Ninyung',
  /** What the operator is, shown next to their name */
  operatorDescription: 'a final-year BSc Information Technology project at the University of Ghana',
  /** Contact address for privacy, legal and general enquiries */
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL ?? '',
  /** Postal address, if one should be published */
  postalAddress: '',
  country: 'Ghana',
  /** Data Protection Commission registration number, once registered */
  dpcRegistration: '',
  /** Date the legal pages were last changed (YYYY-MM-DD) */
  legalUpdated: '2026-10-21',
} as const;
