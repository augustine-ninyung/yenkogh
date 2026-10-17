import React from 'react';
import { Link } from 'react-router-dom';
import { SITE } from '@/config/site';
import { formatDate } from '@/utils/formatters';

// ─── LegalPage ────────────────────────────────────────────────────────────────
// Shared shell for the privacy, terms and cookie pages: a readable column with
// a heading, the last-updated date, a table of contents and links between them.

export interface LegalSection {
  id: string;
  title: string;
  body: React.ReactNode;
}

interface LegalPageProps {
  title: string;
  intro: React.ReactNode;
  sections: LegalSection[];
}

const LEGAL_LINKS = [
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Use' },
  { to: '/cookies', label: 'Cookie Policy' },
];

/** How to reach the operator, with the feedback form when no email is published. */
export const ContactLine: React.FC = () =>
  SITE.contactEmail ? (
    <a href={`mailto:${SITE.contactEmail}`} className="font-semibold underline underline-offset-2">
      {SITE.contactEmail}
    </a>
  ) : (
    <>the feedback form at the bottom of any destination or festival page</>
  );

export const LegalPage: React.FC<LegalPageProps> = ({ title, intro, sections }) => {
  React.useEffect(() => {
    document.title = `${title} – ${SITE.name}`;
  }, [title]);

  return (
    <div className="pt-28 pb-20 bg-white dark:bg-[#090C11] text-[#262B32] dark:text-white">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#090C11] dark:text-white mb-3">{title}</h1>
          <p className="text-sm text-muted">
            Last updated <time dateTime={SITE.legalUpdated}>{formatDate(SITE.legalUpdated)}</time>
          </p>
          <div className="mt-6 text-[15px] leading-relaxed space-y-3">{intro}</div>
        </header>

        <nav aria-label="On this page" className="mb-10 p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">On this page</h2>
          <ol className="list-decimal list-inside space-y-1.5 text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="underline-offset-2 hover:underline">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-10">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="scroll-mt-28">
              <h2 id={`${s.id}-title`} className="text-xl font-bold text-[#090C11] dark:text-white mb-3">
                {i + 1}. {s.title}
              </h2>
              <div className="text-[15px] leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:underline [&_a]:underline-offset-2">
                {s.body}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-14 pt-6 border-t border-gray-100 dark:border-white/10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {LEGAL_LINKS.filter((l) => l.label !== title).map((l) => (
            <Link key={l.to} to={l.to} className="font-semibold underline underline-offset-2">
              {l.label}
            </Link>
          ))}
        </footer>
      </article>
    </div>
  );
};

export default LegalPage;
