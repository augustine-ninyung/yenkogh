import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, Landmark, ChevronLeft, CheckCircle2, ExternalLink, Info, Compass } from 'lucide-react';
import { getFestivalById, getFestivalsByRegion } from '@/data/festivals';
import { FESTIVAL_CATEGORY_META } from '@/components/festivals/festivalMeta';
import { FestivalCard } from '@/components/cards/FestivalCard';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

const FESTIVALS_URL = '/events?view=festivals';

const sourceLabel = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-xl font-bold mb-3">{title}</h2>
    {children}
  </section>
);

export const FestivalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const festival = getFestivalById(id || '');

  if (!festival) {
    return (
      <div className="min-h-screen pt-32 pb-20 max-w-xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold mb-3">Festival Not Found</h2>
        <p className="text-[#757B81] mb-6">The festival you are looking for could not be found.</p>
        <Link to={FESTIVALS_URL}>
          <Button variant="primary">Browse all festivals</Button>
        </Link>
      </div>
    );
  }

  const meta = FESTIVAL_CATEGORY_META[festival.category];
  const Icon = meta.icon;
  const related = getFestivalsByRegion(festival.region)
    .filter((f) => f.id !== festival.id)
    .slice(0, 3);

  // Only facts that are actually on record are shown
  const facts = [
    { icon: Calendar, label: 'When', value: festival.month },
    { icon: Clock, label: 'Usual date', value: festival.usualDate },
    { icon: Clock, label: 'Duration', value: festival.duration },
    { icon: MapPin, label: 'Town', value: festival.town },
    { icon: Landmark, label: 'Traditional area', value: festival.traditionalArea },
    { icon: Users, label: 'People', value: festival.ethnicGroup },
  ].filter((fact) => fact.value);

  const regionText = [festival.region, ...festival.otherRegions].join(', ');

  return (
    <div className="pt-20 pb-20 bg-gray-50 dark:bg-[#090C11] min-h-screen text-[#262B32] dark:text-white">
      {/* Banner */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        {festival.image ? (
          <img src={festival.image} alt={festival.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className={cn('absolute inset-0 bg-gradient-to-br flex items-center justify-center', meta.gradient)}>
            <Icon className="w-40 h-40 text-white/15" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090C11]/90 via-[#090C11]/30 to-[#090C11]/40" />

        <div className="absolute inset-x-0 bottom-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 text-white">
            <Link
              to={FESTIVALS_URL}
              className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white mb-4 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> All festivals
            </Link>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFD300] px-3 py-1 text-xs font-bold text-[#090C11]">
                <Icon className="w-3.5 h-3.5" />
                {meta.label}
              </span>
              <span className="rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-3 py-1 text-xs font-semibold">
                {regionText}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{festival.name}</h1>
            {festival.alternateNames.length > 0 && (
              <p className="mt-2 text-sm text-white/70">Also known as {festival.alternateNames.join(', ')}</p>
            )}
          </div>
        </div>

        {festival.imageCredit && (
          <a
            href={festival.imageCredit}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-3 right-4 text-[11px] text-white/60 hover:text-white/90 transition-colors"
          >
            Photo: Wikimedia Commons
          </a>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main column */}
        <div className="lg:col-span-2">
          {festival.completeness === 'name-only' ? (
            <div className="flex gap-3 rounded-2xl border border-amber-300/50 bg-amber-50 dark:bg-amber-900/10 p-5 mb-8">
              <Info className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-900 dark:text-amber-200">
                This festival is listed in official cultural records, but its date, history and activities are not yet documented here.
              </p>
            </div>
          ) : (
            <p className="text-lg leading-relaxed text-[#262B32]/90 dark:text-white/85 mb-8">{festival.description}</p>
          )}

          {festival.historicalSignificance && (
            <Section title="History">
              <p className="leading-relaxed text-[#757B81] dark:text-white/70">{festival.historicalSignificance}</p>
            </Section>
          )}

          {festival.culturalSignificance && (
            <Section title="Cultural significance">
              <p className="leading-relaxed text-[#757B81] dark:text-white/70">{festival.culturalSignificance}</p>
            </Section>
          )}

          {festival.activities.length > 0 && (
            <Section title="What happens">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {festival.activities.map((activity) => (
                  <li key={activity} className="flex gap-2.5 text-sm text-[#262B32] dark:text-white/85">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#FFD300] mt-0.5" />
                    {activity}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {festival.attractionsNearby.length > 0 && (
            <Section title="Nearby attractions">
              <div className="flex flex-wrap gap-2">
                {festival.attractionsNearby.map((place) => (
                  <span
                    key={place}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#262B32] px-3 py-1.5 text-sm"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#FFD300]" />
                    {place}
                  </span>
                ))}
              </div>
            </Section>
          )}

        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#262B32] p-6">
            <h2 className="font-bold mb-4">At a glance</h2>
            {facts.length > 0 ? (
              <dl className="space-y-4">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex gap-3">
                    <fact.icon className="w-4 h-4 shrink-0 text-[#FFD300] mt-0.5" />
                    <div>
                      <dt className="text-xs text-[#757B81] dark:text-white/50">{fact.label}</dt>
                      <dd className="text-sm font-medium">{fact.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-[#757B81]">No dates or places are on record yet.</p>
            )}
            {!festival.month && facts.length > 0 && (
              <p className="mt-4 text-xs text-[#757B81] dark:text-white/50">The time of year is not on record.</p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#262B32] p-6">
            <h2 className="font-bold mb-3">Sources</h2>
            <ul className="space-y-2">
              {festival.sources.map((url) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-[#757B81] dark:text-white/70 hover:text-[#FFD300] transition-colors break-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    {sourceLabel(url)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-6">More festivals in the {festival.region} Region</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((f) => (
              <FestivalCard key={f.id} festival={f} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FestivalDetailPage;
