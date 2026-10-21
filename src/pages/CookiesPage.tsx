import React from 'react';
import { Link } from 'react-router-dom';
import { LegalPage, ContactLine, type LegalSection } from '@/components/legal/LegalPage';
import { SITE } from '@/config/site';

// Every key the app writes to browser storage. Keep in step with the code:
// `grep -rn "yenkogh_" src` lists them.
const ITEMS: { name: string; where: string; purpose: string; kept: string }[] = [
  { name: 'sb-…-auth-token', where: 'Local storage', purpose: 'Keeps you signed in (set by our sign-in provider, Supabase).', kept: 'Until you sign out' },
  { name: 'yenkogh_theme', where: 'Local storage', purpose: 'Remembers light or dark mode.', kept: 'Until cleared' },
  { name: 'yenkogh_favorites', where: 'Local storage', purpose: 'Your saved places and events on this device.', kept: 'Until cleared' },
  { name: 'yenkogh_viewed_destinations', where: 'Session storage', purpose: 'Stops one visit to a page being counted twice in the anonymous page count.', kept: 'Until the tab closes' },
  { name: 'yenkogh_reloaded_for_page', where: 'Session storage', purpose: 'Recovers once if a page fails to load after a site update.', kept: 'Until the tab closes' },
  { name: 'yenkogh_admin_login_logged', where: 'Session storage', purpose: 'Administrators only: records a sign-in once per session in the audit log.', kept: 'Until the tab closes' },
];

const sections: LegalSection[] = [
  {
    id: 'summary',
    title: 'Summary',
    body: (
      <p>
        {SITE.name} sets <strong>no cookies</strong> of its own and uses <strong>no advertising or tracking</strong>{' '}
        technology. Our anonymous page counts (see the Privacy Policy) set no cookies and store nothing in your browser. It stores a few items in your browser that are strictly needed for features you use, such as
        staying signed in. These do not need consent, so you will not see a cookie banner here.
      </p>
    ),
  },
  {
    id: 'items',
    title: 'What we store in your browser',
    body: (
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full min-w-[560px] text-sm border-collapse">
          <caption className="sr-only">Browser storage used by {SITE.name}</caption>
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-white/15">
              <th scope="col" className="py-2 pr-3 font-semibold">Name</th>
              <th scope="col" className="py-2 pr-3 font-semibold">Type</th>
              <th scope="col" className="py-2 pr-3 font-semibold">Purpose</th>
              <th scope="col" className="py-2 font-semibold">Kept</th>
            </tr>
          </thead>
          <tbody>
            {ITEMS.map((i) => (
              <tr key={i.name} className="align-top border-b border-gray-100 dark:border-white/10">
                <td className="py-2.5 pr-3 font-mono text-xs break-all">{i.name}</td>
                <td className="py-2.5 pr-3 whitespace-nowrap">{i.where}</td>
                <td className="py-2.5 pr-3">{i.purpose}</td>
                <td className="py-2.5 whitespace-nowrap">{i.kept}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: 'third-party',
    title: 'Third parties',
    body: (
      <p>
        Fonts are served from our own site. Photos load from Unsplash and Wikimedia Commons; loading an image shares
        your IP address with them, as with any website. They do not set cookies through our pages. We have no
        embedded videos, maps, social media widgets or ad networks.
      </p>
    ),
  },
  {
    id: 'control',
    title: 'Clearing or blocking storage',
    body: (
      <p>
        You can clear site data at any time in your browser's settings (usually under Privacy, then Cookies and site
        data). If you do, you will be signed out and your theme and saved places on this device will reset. Your account
        data stays safe on our servers.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes and contact',
    body: (
      <p>
        If we ever add anything that needs your consent, we will ask first and update this page.
        Questions? Contact us at <ContactLine />, or see the <Link to="/privacy">Privacy Policy</Link>.
      </p>
    ),
  },
];

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      intro={<p>This page lists everything {SITE.name} stores in your browser and why.</p>}
      sections={sections}
    />
  );
}
