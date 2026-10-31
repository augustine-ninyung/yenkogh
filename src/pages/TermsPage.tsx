import React from 'react';
import { Link } from 'react-router-dom';
import { LegalPage, ContactLine, type LegalSection } from '@/components/legal/LegalPage';
import { SITE } from '@/config/site';

const sections: LegalSection[] = [
  {
    id: 'service',
    title: 'The service',
    body: (
      <p>
        {SITE.name} is a free guide to travelling in Ghana. It lists destinations, festivals and transport options,
        and offers a trip planner and a budget calculator. It is run by {SITE.operator}, {SITE.operatorDescription}.
        By using the site you agree to these terms. If you do not agree, please do not use it.
      </p>
    ),
  },
  {
    id: 'payments',
    title: 'Price, payments and refunds',
    body: (
      <>
        <p>
          {SITE.name} is free. We do not sell anything, take payments or handle bookings, so there is nothing to
          refund.
        </p>
        <p>
          Any tickets, transport, accommodation or entry fees you pay for are bought directly from those providers.
          Their own terms and refund policies apply, and questions about them should go to the provider.
        </p>
      </>
    ),
  },
  {
    id: 'accuracy',
    title: 'Information on the site',
    body: (
      <>
        <p>
          We work to keep listings accurate, but prices, fees, opening hours, routes and festival dates change, often
          without notice. Everything on the site is a guide, not a guarantee.{' '}
          <strong>Always confirm details with the operator or venue before you travel.</strong>
        </p>
        <p>
          The trip planner uses an AI model to draft itineraries from our listings. AI output can be wrong or
          incomplete, so check a plan before you rely on it. Safety tips are general advice; follow local
          authorities and official travel advisories.
        </p>
        <p>If you spot a mistake, please use the feedback form on that page so we can fix it.</p>
      </>
    ),
  },
  {
    id: 'guides',
    title: 'Tour guides',
    body: (
      <p>
        Guides on the site are independent and are not employed by {SITE.name}. Before listing a guide we check their
        licence and ask for their agreement, but we do not supervise their work or guarantee it. You arrange dates,
        prices and payment directly with the guide, and any agreement is between you and them. Please check a guide's
        licence is still current before you travel.
      </p>
    ),
  },
  {
    id: 'accounts',
    title: 'Your account',
    body: (
      <ul>
        <li>Give accurate details and keep your password private. You are responsible for activity on your account.</li>
        <li>You can delete your account at any time from your profile page.</li>
        <li>
          We may suspend accounts that break these terms, for example through abuse, spam or attempts to get round
          security.
        </li>
      </ul>
    ),
  },
  {
    id: 'use',
    title: 'Acceptable use',
    body: (
      <>
        <p>Please do not:</p>
        <ul>
          <li>send false, abusive, unlawful or misleading content, including fake reviews or corrections;</li>
          <li>try to access other people's data or parts of the service you are not allowed to;</li>
          <li>overload, scrape or automate requests to the service, including the trip planner;</li>
          <li>use the service to break any law of Ghana or of the place you are in.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'content',
    title: 'Content you send us',
    body: (
      <p>
        You keep ownership of feedback and other content you send. You allow us to use it to run and improve the
        service, for example by correcting a listing based on your report. We do not publish your name with it.
      </p>
    ),
  },
  {
    id: 'ip',
    title: 'Our content and photos',
    body: (
      <p>
        The site's design, text and code belong to the operator. Photos come from Unsplash (under the Unsplash
        licence) and Wikimedia Commons (under the licence shown on each photo's page). Their copyright stays with
        the photographers; every photo's source is listed on the <Link to="/credits">Photo credits</Link> page. Festival and destination descriptions cite their public sources where available.
      </p>
    ),
  },
  {
    id: 'links',
    title: 'Links to other sites',
    body: (
      <p>
        We link to official festival pages, sources and photo credits. We are not responsible for the content or
        practices of those sites.
      </p>
    ),
  },
  {
    id: 'liability',
    title: 'Liability',
    body: (
      <p>
        The service is provided free and "as is". As far as the law allows, we are not liable for losses from
        relying on information on the site, from travel arrangements made with third parties, or from the service
        being unavailable. Nothing in these terms limits rights you have under Ghanaian consumer protection law that
        cannot be excluded.
      </p>
    ),
  },
  {
    id: 'law',
    title: 'Governing law',
    body: <p>These terms are governed by the laws of the Republic of Ghana, and Ghanaian courts have jurisdiction.</p>,
  },
  {
    id: 'changes',
    title: 'Changes and contact',
    body: (
      <>
        <p>
          We may update these terms. The date at the top shows when they last changed, and continuing to use the
          site means you accept the update.
        </p>
        <p>
          Questions? Contact us at <ContactLine />. How we handle personal data is covered in the{' '}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      intro={<p>These terms explain what {SITE.name} offers, what it does not, and the rules for using it.</p>}
      sections={sections}
    />
  );
}
