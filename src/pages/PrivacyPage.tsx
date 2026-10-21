import React from 'react';
import { Link } from 'react-router-dom';
import { LegalPage, ContactLine, type LegalSection } from '@/components/legal/LegalPage';
import { SITE } from '@/config/site';

// Describes what the app actually does with personal data. When a feature
// starts collecting something new, update this page in the same change.

const sections: LegalSection[] = [
  {
    id: 'who',
    title: 'Who we are',
    body: (
      <>
        <p>
          {SITE.name} is run by {SITE.operator}, {SITE.operatorDescription}, in {SITE.country}. For this policy,
          the operator is the data controller: the party that decides how your personal data is used.
        </p>
        {SITE.postalAddress && <p>Postal address: {SITE.postalAddress}</p>}
        {SITE.dpcRegistration && <p>Data Protection Commission registration: {SITE.dpcRegistration}</p>}
        <p>
          You can reach us at <ContactLine />.
        </p>
      </>
    ),
  },
  {
    id: 'collect',
    title: 'What we collect',
    body: (
      <>
        <p>We only collect what the features you use need:</p>
        <ul>
          <li>
            <strong>Your account:</strong> your name, email address and password. The password is stored only in
            hashed form by our sign-in provider; we never see it.
          </li>
          <li>
            <strong>Things you add:</strong> an optional bio, your display preferences, places and events you save,
            and the trips and budgets you create.
          </li>
          <li>
            <strong>Feedback you send:</strong> the message, what it is about, and your name and email so we can
            follow up.
          </li>
          <li>
            <strong>Trip planner requests:</strong> what you type into the AI planner and the options you pick. See
            section 4 for where this goes. We keep only a summary of each run (number of days, number of
            activities, how long it took), not your text.
          </li>
          <li>
            <strong>Technical data:</strong> our hosting and database providers process your IP address and basic
            request details (such as browser type) to deliver pages and protect the service from abuse.
          </li>
        </ul>
        <p>
          We also keep anonymous daily totals of how the site is used: which kind of page was opened (for
          example &ldquo;a destination page&rdquo;), the website a visit came from, and whether the screen is phone,
          tablet or computer sized. These are added straight into totals with no IP address, account, cookie or
          identifier, so they cannot be linked to you or your device. If your browser sends Global Privacy
          Control or Do Not Track, nothing is counted. Totals are kept for about 13 months.
        </p>
        <p>
          We do <strong>not</strong> collect payment details, your location, or your contacts. We do not use
          advertising, third-party analytics or tracking tools, and we do not sell or rent personal data.
        </p>
      </>
    ),
  },
  {
    id: 'use',
    title: 'How we use it, and why we are allowed to',
    body: (
      <ul>
        <li>
          <strong>To provide the service you asked for</strong>: your account, saved items, trips, budgets and
          planner. We rely on your consent when you create an account, and on this processing being necessary to
          provide the service.
        </li>
        <li>
          <strong>To answer feedback and correct listings</strong>: based on your consent when you send it.
        </li>
        <li>
          <strong>To keep the service secure</strong>, for example by blocking abuse and keeping a record of
          administrator actions. This is our legitimate interest in running a safe service.
        </li>
      </ul>
    ),
  },
  {
    id: 'share',
    title: 'Who we share it with',
    body: (
      <>
        <p>We use a small number of service providers that process data on our behalf:</p>
        <ul>
          <li>
            <strong>Supabase</strong>: database and sign-in. Stores your account and the content you create.
          </li>
          <li>
            <strong>Vercel</strong>: hosting. Delivers the site and runs the trip planner.
          </li>
          <li>
            <strong>Google (Gemini API)</strong>: when you use the AI trip planner, your request and the matching
            catalogue entries are sent to Google to write the plan. Your name and email are not sent. Depending on
            the service tier in use, Google may keep this content to improve its services, so{' '}
            <strong>please do not put personal details in planner requests</strong>.
          </li>
        </ul>
        <p>
          Photos on the site are loaded from Unsplash and Wikimedia Commons, which receive your IP address in the
          same way as any website you load an image from.
        </p>
        <p>
          These providers may process data outside {SITE.country}. We only use providers that commit to protecting
          it. We will disclose personal data to authorities only when Ghanaian law requires it.
        </p>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'How long we keep it',
    body: (
      <ul>
        <li>Account data, saved items, trips and budgets: until you delete them or your account.</li>
        <li>Feedback: until it is resolved, then for up to 12 months as a record of changes to listings.</li>
        <li>Planner run summaries: up to 12 months. They contain no text you typed.</li>
        <li>Hosting and security logs: kept by our providers for their standard periods, usually 30 days or less.</li>
      </ul>
    ),
  },
  {
    id: 'rights',
    title: 'Your rights',
    body: (
      <>
        <p>
          Under Ghana's Data Protection Act, 2012 (Act 843), and similar laws where you live, you can:
        </p>
        <ul>
          <li>ask for a copy of the personal data we hold about you;</li>
          <li>correct it: most of it you can edit yourself on your <Link to="/profile">profile page</Link>;</li>
          <li>
            delete it: you can delete your account and everything linked to it from your{' '}
            <Link to="/profile">profile page</Link>;
          </li>
          <li>withdraw consent or object to processing at any time;</li>
          <li>
            complain to the Data Protection Commission of Ghana (
            <a href="https://dataprotection.org.gh" target="_blank" rel="noopener noreferrer">
              dataprotection.org.gh
            </a>
            ).
          </li>
        </ul>
        <p>
          To use any of these rights, contact us at <ContactLine />. We will reply within 21 days.
        </p>
      </>
    ),
  },
  {
    id: 'storage',
    title: 'Cookies and browser storage',
    body: (
      <p>
        We do not use advertising, analytics or tracking cookies. The site keeps a few items in your browser so that sign-in,
        your theme and your saved places work. The <Link to="/cookies">Cookie Policy</Link> lists them all.
      </p>
    ),
  },
  {
    id: 'children',
    title: 'Children',
    body: (
      <p>
        {SITE.name} is meant for people aged 18 and over. Anyone younger should only use it with a parent's or
        guardian's permission. If you believe a child has given us personal data without that permission, contact
        us and we will delete it.
      </p>
    ),
  },
  {
    id: 'security',
    title: 'Security',
    body: (
      <p>
        Data is encrypted in transit (HTTPS), passwords are hashed, and database access rules mean each person can
        only read their own account data. No system is perfectly secure. If a breach affects your data, we will tell
        you and the Data Protection Commission as the law requires.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: (
      <p>
        If we change how we use personal data, we will update this page and its date. If the change is
        significant, we will also tell signed-in users.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={
        <p>
          This policy explains what personal data {SITE.name} collects, why, who it is shared with, and the choices
          you have. In short: we collect little, use no trackers, and never sell your data.
        </p>
      }
      sections={sections}
    />
  );
}
