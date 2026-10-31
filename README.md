# YɛnkɔGH — Smart Tourism and Transportation Planning for Ghana

Final-year BSc Information Technology project, University of Ghana.

YɛnkɔGH is a web application for planning travel in Ghana. It brings destination discovery, festival listings, transport guidance, budget planning and an AI trip planner into one place.

---

## Overview

Planning a trip in Ghana usually means jumping between many websites for attractions, transport, events and costs. YɛnkɔGH puts these in one place. Visitors can browse destinations and festivals, check how to get between regions, estimate a budget, and get a day-by-day itinerary drafted by AI from the site's own listings.

---

## Features

### Travellers

- Account registration, sign-in and password reset (email based)
- Destination discovery with search, filters by region and type, and detail pages
- Festival and event listings, including a catalogue of over 100 traditional festivals with cited sources
- Transportation guide: trotro, STC/VIP buses, ride-hailing, domestic flights and ferries, with a route search
- Tour guide directory: licensed guides checked by administrators, searchable by name, language, specialty and region
- Budget planner with spending categories and charts
- AI trip planner: describe a trip in plain words or use the form, and get a day-by-day itinerary
- Save destinations and events, save trips, download itineraries as PDF
- Feedback form on listings for reporting corrections
- Profile management, password change and self-service account deletion
- Light and dark themes, responsive layout

### Administrators

- Dashboard with content, usage and feedback statistics
- Add and verify tour guides; the database refuses to publish a guide who is unverified or has not agreed to be listed
- Traffic page: page views per day, most opened pages, where visits came from and screen sizes, over 7, 30 or 90 days
- Create, edit, publish and archive destinations, events, festivals, regions and transport options
- Image upload to storage
- User management (roles, suspension)
- Feedback moderation
- Audit log of administrator actions

---

## How the AI planner works

The planner is grounded in retrieval rather than in what the model remembers:

1. The request (free text and/or form) is parsed for trip length, budget, party size, dates and named places.
2. Matching destinations, festivals and transport routes are retrieved from the database and ranked.
3. Only those records are given to the language model (Google Gemini), which is told to build the plan from them.
4. The model's answer is checked against the records before it is returned. Each run records how many activities were *grounded* in real listings.
5. If the model is unavailable or returns something unusable, the plan is assembled directly from the same records instead.

The model key is read only by the server function, so it never reaches the browser. The planner's logic is covered by the test suite.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS 4, React Router 7 |
| Charts and export | Recharts, jsPDF |
| Backend | Supabase: PostgreSQL, Auth, Storage, Row Level Security |
| Server function | Vercel serverless function ([api/plan-trip.ts](api/plan-trip.ts)) |
| AI | Google Gemini API, with retrieval over the site's own catalogue |
| Hosting | Vercel |

Without Supabase credentials, the app runs entirely in the browser on its bundled content and built-in demo accounts. This is useful for demonstrations and development.

---

## Architecture

```
Browser (React SPA)
   │
   ├── Supabase JS client ──► Supabase
   │                           ├── PostgreSQL (content, profiles, trips, budgets, feedback)
   │                           ├── Auth (email + password, hashed by Supabase)
   │                           ├── Storage (admin-uploaded images)
   │                           └── Row Level Security: each user reads only their own rows
   │
   └── POST /api/plan-trip ──► Vercel function ──► Supabase (catalogue lookup)
                                                └► Google Gemini (itinerary draft)
```

---

## Project structure

```
api/
  plan-trip.ts          AI trip planner (Vercel function; also mounted by the Vite dev server)
public/                 Static files
scripts/
  build-seed.ts         Generates supabase/seed.sql and setup.sql from src/data
src/
  components/           UI components (ui/, cards/, navigation/, auth/, admin/, legal/ …)
  config/site.ts        Operator and contact details used by the footer and legal pages
  context/              Auth, theme, favourites and toast providers
  data/                 Bundled starting content (destinations, festivals, regions, transport)
  hooks/                Data and UI hooks
  layouts/              Public, dashboard and admin layouts
  pages/                Route pages, including admin/ and the legal pages
  routes/               Route table and guards
  services/             Data access (Supabase, with a local fallback)
  utils/                Formatting, validation, trip planning helpers
supabase/
  setup.sql             Complete database setup (schema + admin + seed)
  schema.sql, admin.sql Tables, policies and functions
  seed.sql              Starting content (generated; do not edit by hand)
  update-*.sql          One-off updates for databases created earlier
tests/
  planner.test.ts       Trip planner and server tests
e2e/                    Browser tests (Playwright)
```

### Browser tests

`npm run test:e2e` builds the app and drives it in Chromium, on a desktop screen and a phone screen. The app runs in demo mode (its backend settings are blanked in `playwright.config.ts`), so tests use browser storage and never touch the live database, and requests to other sites are blocked. They cover:

- **Visitors:** finding and opening destinations, legal and credits pages, the not-found page, members-only redirects, the skip link
- **Accounts:** sign-up (including the consent requirement), wrong passwords, adding and removing a profile photo, refusing non-photo files, deleting an account
- **Trip tools:** saving places, planning a trip from a description, adding a budget expense
- **Admin:** keeping travellers and visitors out, moving between admin pages, getting back to the site on desktop and phone
- **Accessibility:** automated WCAG 2.1 AA checks (axe-core) on 13 pages in light and dark themes

On a failure, a screenshot and trace are saved under `test-results/`; open the report with `npx playwright show-report`.

---

## Getting started

Requires Node.js 20 or later.

```bash
git clone <repository-url>
cd <repository-folder>
npm install
npm run dev
```

The app opens at http://localhost:5173. With no configuration it runs in demo mode. Sign in with:

| Account | Email | Password |
|---|---|---|
| Traveller | `user@yenkogh.com` | `password123` |
| Administrator | `admin@yenkogh.com` | `admin123` |

### Connecting Supabase and the AI planner

1. Create a Supabase project and run [supabase/setup.sql](supabase/setup.sql) in its SQL editor. If the database was created before October 2026, also run the `update-2026-10*.sql` files.
2. Copy `.env.example` to `.env.local` and fill in:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`: from Project Settings → API
   - `GEMINI_API_KEY`: optional; switches on the AI model (without it, plans are built from the catalogue)
   - `VITE_CONTACT_EMAIL`: the public contact address shown on the legal pages
3. Sign up in the app, then make yourself an administrator in the SQL editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server, including `/api/plan-trip` |
| `npm run build` | Type-check and production build |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Trip planner and server tests |
| `npm run test:e2e` | Browser tests of the main journeys and accessibility (first run: `npx playwright install chromium`) |
| `npm run db:seed` | Regenerate `supabase/seed.sql` and `setup.sql` from `src/data` |

### Deploying

The project deploys to Vercel as-is ([vercel.json](vercel.json) sets the build, SPA rewrites, security headers and the planner function's timeout). Set the same environment variables in the Vercel project.

---

## Security and privacy

- Passwords are hashed by Supabase Auth (in demo mode, salted PBKDF2 in the browser)
- Row Level Security on every table; administrator actions are checked in the database and recorded in an audit log
- The AI key stays server-side; planner requests are size-limited and validated
- Security headers: HSTS, `X-Frame-Options: DENY`, `nosniff`, a strict referrer policy and a permissions policy
- No third-party analytics, advertising or tracking; fonts are self-hosted; no cookies
- Minimal data collection: planner runs keep counts, not request text
- Site traffic (admin Traffic page) is kept as anonymous daily totals of page type, referring domain and screen-size class, with no IP address, account or identifier; browsers sending Global Privacy Control or Do Not Track are not counted
- Users can delete their account and all linked data from their profile
- Privacy Policy, Terms of Use and Cookie Policy pages at `/privacy`, `/terms` and `/cookies`, written against Ghana's Data Protection Act, 2012 (Act 843)

## Accessibility

- Text colours meet WCAG AA contrast in both themes
- A skip link, visible keyboard focus, labelled controls and announced form errors
- Dialogs trap focus and close with Escape
- The hero slideshow can be paused and stays still for reduced-motion users

---

## Future work

- Booking integration with transport and accommodation providers
- Mobile Money payments
- Real-time transport tracking
- Weather and map integration
- Twi, Ewe, Ga and French translations
- Verified traveller reviews
- Offline support

---

## Author

**Augustine Ninyung**: BSc Information Technology, University of Ghana

## Licence

Developed for academic purposes. Photos are from Unsplash and Wikimedia Commons under their respective licences, credited on each page where required.
