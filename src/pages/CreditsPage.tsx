import React from 'react';
import { Link } from 'react-router-dom';
import { destinations } from '@/data/destinations';
import { events } from '@/data/events';
import { festivals } from '@/data/festivals';
import { regions } from '@/data/regions';
import { transportation } from '@/data/transportation';
import { creditFor } from '@/utils/imageCredit';
import { safeUrl } from '@/utils/safeUrl';
import { SITE } from '@/config/site';

// Lists the source of every photo on the site, read from the same content the
// pages show, so it stays complete as listings and photos change.

interface Credit {
  subject: string;
  link?: string;
}

const withCredit = (subject: string, imageUrl: string | undefined, recorded?: string): Credit[] =>
  imageUrl ? [{ subject, link: safeUrl(creditFor(imageUrl, recorded)) }] : [];

const groups = (): { title: string; credits: Credit[] }[] => [
  {
    title: 'Destinations',
    credits: destinations.flatMap((d) => [
      ...withCredit(d.name, d.imageUrl, d.imageCredit),
      ...d.gallery.filter((g) => g.url !== d.imageUrl).flatMap((g) => withCredit(`${d.name}: ${g.alt}`, g.url)),
    ]),
  },
  { title: 'Events', credits: events.flatMap((e) => withCredit(e.name, e.imageUrl)) },
  { title: 'Festivals', credits: festivals.flatMap((f) => withCredit(f.name, f.image, f.imageCredit)) },
  { title: 'Regions', credits: regions.flatMap((r) => withCredit(`${r.name} Region`, r.imageUrl)) },
  { title: 'Getting around', credits: transportation.flatMap((t) => withCredit(t.name, t.imageUrl)) },
];

export default function CreditsPage() {
  React.useEffect(() => {
    document.title = `Photo credits – ${SITE.name}`;
  }, []);

  return (
    <div className="pt-28 pb-20 bg-white dark:bg-[#090C11] text-[#262B32] dark:text-white">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#090C11] dark:text-white mb-4">Photo credits</h1>
        <div className="text-[15px] leading-relaxed space-y-3 mb-10">
          <p>
            Photos of places, events and transport come from Wikimedia Commons, shared by their photographers under
            Creative Commons or public-domain licences. Each link below opens the photo's page, which names the
            photographer and the licence. The photos have been resized but not otherwise changed.
          </p>
          <p>
            The slideshow on the home page and the sign-in pages use photos from Unsplash, credited on the photo
            itself. If you took one of these photos and something here is wrong, please tell us via the{' '}
            <Link to="/privacy#who" className="underline underline-offset-2">contact details</Link>.
          </p>
        </div>

        <div className="space-y-10">
          {groups().map((g) => (
            <section key={g.title} aria-labelledby={`credits-${g.title}`}>
              <h2 id={`credits-${g.title}`} className="text-xl font-bold text-[#090C11] dark:text-white mb-3">
                {g.title}
              </h2>
              <ul className="divide-y divide-gray-100 dark:divide-white/10 text-sm">
                {g.credits.map((c) => (
                  <li key={c.subject} className="py-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span>{c.subject}</span>
                    {c.link ? (
                      <a href={c.link} target="_blank" rel="noopener noreferrer" className="text-muted underline underline-offset-2 hover:text-[#090C11] dark:hover:text-white">
                        Photographer and licence
                      </a>
                    ) : (
                      <span className="text-muted">Source not recorded</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
