import { useCallback, useEffect, useMemo, useState } from 'react';
import { BadgeCheck, Mail, Phone, Search, UserRound } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { regions } from '@/data/regions';
import { tourGuideService } from '@/services/tourGuideService';
import type { TourGuide } from '@/types';
import { mailLink, telLink } from '@/utils/contactLinks';
import { formatDate } from '@/utils/formatters';

// ─── GuidesPage ───────────────────────────────────────────────────────────────
// Licensed tour guides whose details an administrator has checked. The site
// only lists them: visitors contact and pay guides directly.

const field =
  'rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#262B32] text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD300]';

const GuideCard: React.FC<{ guide: TourGuide }> = ({ guide }) => {
  const tel = telLink(guide.phone);
  const mail = mailLink(guide.email);
  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#262B32] p-5">
      <div className="flex items-center gap-3">
        <Avatar name={guide.name} size="lg" decorative />
        <div className="min-w-0">
          <h2 className="font-semibold text-[#090C11] dark:text-white">{guide.name}</h2>
          <p className="text-sm text-muted dark:text-white/70">{guide.region}</p>
        </div>
      </div>

      {guide.bio && <p className="text-sm text-[#262B32] dark:text-white/85">{guide.bio}</p>}

      <dl className="space-y-1 text-sm">
        {guide.languages.length > 0 && (
          <div className="flex gap-1.5">
            <dt className="text-muted dark:text-white/70">Languages:</dt>
            <dd>{guide.languages.join(', ')}</dd>
          </div>
        )}
        {guide.specialties.length > 0 && (
          <div className="flex gap-1.5">
            <dt className="text-muted dark:text-white/70">Specialties:</dt>
            <dd>{guide.specialties.join(', ')}</dd>
          </div>
        )}
      </dl>

      <p className="flex items-start gap-1.5 text-xs text-muted dark:text-white/70">
        <BadgeCheck size={14} className="shrink-0 mt-px" aria-hidden="true" />
        <span>
          Licence {guide.licenceNumber}, checked on {formatDate(guide.verifiedOn)}
        </span>
      </p>

      {(tel || mail) && (
        <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 border-t border-gray-100 dark:border-white/10 pt-3 text-sm font-medium">
          {tel && (
            <a href={tel} className="inline-flex items-center gap-1.5 underline underline-offset-2">
              <Phone size={14} aria-hidden="true" />
              {guide.phone}
            </a>
          )}
          {mail && (
            <a href={mail} className="inline-flex items-center gap-1.5 underline underline-offset-2 break-all">
              <Mail size={14} className="shrink-0" aria-hidden="true" />
              {guide.email}
            </a>
          )}
        </div>
      )}
    </li>
  );
};

export default function GuidesPage() {
  const [guides, setGuides] = useState<TourGuide[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('');

  const load = useCallback(async () => {
    setError(null);
    try {
      setGuides(await tourGuideService.listPublished());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load tour guides.');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (guides ?? []).filter(
      (g) =>
        (!region || g.region === region) &&
        (!q || [g.name, g.region, ...g.languages, ...g.specialties].join(' ').toLowerCase().includes(q)),
    );
  }, [guides, query, region]);

  return (
    <div className="pt-20 pb-20 bg-gray-50 dark:bg-[#090C11] min-h-screen text-[#262B32] dark:text-white">
      <PageHeader
        title="Tour guides"
        description="Licensed guides whose details we have checked. Contact them directly to agree dates and prices."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <ErrorState title="Could not load tour guides" message={error} onRetry={load} />
        ) : guides === null ? (
          <p className="py-16 text-center text-sm text-muted">Loading tour guides…</p>
        ) : guides.length === 0 ? (
          <EmptyState
            icon={<UserRound size={28} aria-hidden="true" />}
            title="No guides listed yet"
            description="Guides appear here once their licence has been checked and they have agreed to be listed."
          />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted w-4 h-4" aria-hidden="true" />
                <input
                  type="search"
                  aria-label="Search tour guides"
                  placeholder="Search by name, language or specialty..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={`${field} w-full h-11 pl-10 pr-4`}
                />
              </div>
              <select aria-label="Filter by region" value={region} onChange={(e) => setRegion(e.target.value)} className={`${field} h-11 px-3`}>
                <option value="">All regions</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {shown.length === 0 ? (
              <EmptyState title="No guides match your search" description="Try another region or fewer words." />
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {shown.map((g) => (
                  <GuideCard key={g.id} guide={g} />
                ))}
              </ul>
            )}
          </>
        )}

        <p className="mt-10 max-w-2xl text-xs text-muted dark:text-white/70">
          Guides are independent and are not employed by {'YɛnkɔGH'}. We do not take bookings or payments for them, so please
          agree the details with your guide. A guide can ask to change or remove their listing using the contact details in the
          Privacy Policy.
        </p>
      </div>
    </div>
  );
}
