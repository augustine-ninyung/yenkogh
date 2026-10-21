import React, { useCallback, useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AdminPageHeader } from '@/components/admin/adminUi';
import { ErrorState } from '@/components/ui/ErrorState';
import { trafficApi, type TrafficStats } from '@/services/adminApi';
import { cn } from '@/utils/cn';

// ─── AdminTrafficPage ─────────────────────────────────────────────────────────
// Anonymous traffic totals: page views per day, the most opened pages, where
// visits came from and the screen sizes used. See record_page_view in
// admin.sql for exactly what is stored (and what is not).

const RANGES = [7, 30, 90] as const;
type Range = (typeof RANGES)[number];

const card = 'rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#262B32] p-5';

const PAGE_NAMES: Record<string, string> = {
  '/': 'Home',
  '/explore': 'Destinations',
  '/explore/:id': 'A destination page',
  '/events': 'Events and festivals',
  '/events/:id': 'An event page',
  '/festivals/:id': 'A festival page',
  '/transportation': 'Getting around',
  '/planner': 'Trip planner',
  '/budget': 'Budget',
  '/login': 'Sign in',
  '/register': 'Create account',
  '/forgot-password': 'Forgot password',
  '/reset-password': 'Reset password',
  '/privacy': 'Privacy Policy',
  '/terms': 'Terms of Use',
  '/cookies': 'Cookie Policy',
  '/credits': 'Photo credits',
  '/dashboard': 'Dashboard',
  '/dashboard/trips': 'Dashboard: trips',
  '/dashboard/saved': 'Dashboard: saved',
  '/dashboard/budget': 'Dashboard: budget',
  '/dashboard/profile': 'Dashboard: profile',
  '/dashboard/settings': 'Dashboard: settings',
  '/profile': 'Profile',
  '(not found)': 'Page not found',
};

const sourceName = (source: string) =>
  source === 'direct' ? 'Direct or bookmarked' : source === 'other' ? 'Other sites' : source;

const DEVICE_NAMES = { mobile: 'Phones', tablet: 'Tablets', desktop: 'Computers' } as const;

const dayLabel = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const share = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

/** A ranked list with a thin bar showing each row's share of the largest. */
const RankedList: React.FC<{ rows: { label: string; value: number }[]; unit: string; empty: string }> = ({ rows, unit, empty }) => {
  const max = Math.max(0, ...rows.map((r) => r.value));
  if (max === 0) return <p className="py-6 text-center text-sm text-muted">{empty}</p>;
  return (
    <table className="w-full text-sm">
      <thead className="sr-only">
        <tr>
          <th scope="col">Name</th>
          <th scope="col">{unit}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label} className="border-b border-gray-100 dark:border-white/5 last:border-0">
            <td className="py-2 pr-3">
              <div className="truncate text-[#262B32] dark:text-white">{r.label}</div>
              <div className="mt-1 h-1 rounded-full bg-gray-100 dark:bg-white/10" aria-hidden="true">
                <div className="h-1 rounded-full bg-[var(--color-chart-mark)]" style={{ width: `${Math.max((r.value / max) * 100, 2)}%` }} />
              </div>
            </td>
            <td className="py-2 text-right tabular-nums text-[#262B32] dark:text-white whitespace-nowrap align-top">
              {r.value.toLocaleString('en-GB')}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const AdminTrafficPage: React.FC = () => {
  const [range, setRange] = useState<Range>(30);
  const [stats, setStats] = useState<TrafficStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setStats(null);
    try {
      setStats(await trafficApi.stats(range));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load traffic.');
    }
  }, [range]);

  useEffect(() => {
    void load();
  }, [load]);

  const views = stats?.days.reduce((n, d) => n + d.views, 0) ?? 0;
  const visits = stats?.days.reduce((n, d) => n + d.visits, 0) ?? 0;
  const deviceTotal = stats?.devices.reduce((n, d) => n + d.views, 0) ?? 0;
  const phones = stats?.devices.find((d) => d.device === 'mobile')?.views ?? 0;

  const rangePicker = (
    <div role="group" aria-label="Time range" className="inline-flex rounded-xl border border-gray-200 dark:border-white/15 p-0.5 bg-white dark:bg-[#262B32]">
      {RANGES.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => setRange(r)}
          aria-pressed={range === r}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD300]',
            range === r ? 'bg-[#262B32] text-white dark:bg-white dark:text-[#090C11]' : 'text-muted hover:text-[#090C11] dark:hover:text-white',
          )}
        >
          {r} days
        </button>
      ))}
    </div>
  );

  return (
    <div>
      <AdminPageHeader
        title="Traffic"
        description="Anonymous page views. No visitor is identified, and browsers that ask not to be tracked are not counted."
        action={rangePicker}
      />

      {error ? (
        <ErrorState title="Could not load traffic" message={error} onRetry={load} />
      ) : (
        <div className="space-y-6">
          {/* Headline figures */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Page views', value: views.toLocaleString('en-GB') },
              { label: 'Visits', value: visits.toLocaleString('en-GB'), note: 'first page of each visit' },
              { label: 'Pages per visit', value: visits > 0 ? (views / visits).toFixed(1) : '–' },
              { label: 'On phones', value: deviceTotal > 0 ? `${share(phones, deviceTotal)}%` : '–', note: 'of page views' },
            ].map((s) => (
              <div key={s.label} className={card}>
                <p className="text-sm text-muted">{s.label}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-[#090C11] dark:text-white">{stats ? s.value : '…'}</p>
                {s.note && <p className="mt-0.5 text-xs text-muted">{s.note}</p>}
              </div>
            ))}
          </div>

          {/* Views per day */}
          <section className={card} aria-labelledby="views-per-day">
            <h2 id="views-per-day" className="font-semibold text-[#090C11] dark:text-white">Page views per day</h2>
            <p className="text-xs text-muted mb-4">Last {range} days.</p>
            <div className="h-64">
              {stats ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.days.map((d) => ({ ...d, label: dayLabel(d.day) }))} margin={{ top: 4, right: 8, bottom: 0, left: -24 }} barCategoryGap={2}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#757B8133" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} interval="preserveStartEnd" minTickGap={24} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
                    <Tooltip
                      cursor={{ fill: '#757B8118' }}
                      contentStyle={{ borderRadius: 12, fontSize: 12 }}
                      formatter={(value) => [Number(value).toLocaleString('en-GB'), 'Page views']}
                    />
                    <Bar dataKey="views" name="Page views" fill="var(--color-chart-mark)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" aria-hidden="true" />
              )}
            </div>
            {stats && (
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer text-muted hover:text-[#090C11] dark:hover:text-white">Show as a table</summary>
                <table className="mt-2 w-full max-w-sm text-sm">
                  <thead>
                    <tr className="text-left text-muted">
                      <th scope="col" className="py-1 font-medium">Day</th>
                      <th scope="col" className="py-1 font-medium text-right">Page views</th>
                      <th scope="col" className="py-1 font-medium text-right">Visits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...stats.days].reverse().map((d) => (
                      <tr key={d.day} className="border-t border-gray-100 dark:border-white/5">
                        <td className="py-1">{dayLabel(d.day)}</td>
                        <td className="py-1 text-right tabular-nums">{d.views}</td>
                        <td className="py-1 text-right tabular-nums">{d.visits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            )}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className={card} aria-labelledby="top-pages">
              <h2 id="top-pages" className="font-semibold text-[#090C11] dark:text-white mb-3">Most opened pages</h2>
              {stats && (
                <RankedList
                  rows={stats.pages.slice(0, 10).map((p) => ({ label: PAGE_NAMES[p.path] ?? p.path, value: p.views }))}
                  unit="Page views"
                  empty="No page views in this period yet."
                />
              )}
            </section>

            <section className={card} aria-labelledby="sources">
              <h2 id="sources" className="font-semibold text-[#090C11] dark:text-white">Where visits came from</h2>
              <p className="text-xs text-muted mb-3">The site linked from, for the first page of each visit.</p>
              {stats && (
                <RankedList
                  rows={stats.referrers.map((r) => ({ label: sourceName(r.source), value: r.visits }))}
                  unit="Visits"
                  empty="No visits in this period yet."
                />
              )}
            </section>

            <section className={card} aria-labelledby="devices">
              <h2 id="devices" className="font-semibold text-[#090C11] dark:text-white">Screen sizes</h2>
              <p className="text-xs text-muted mb-3">Share of page views, by screen width.</p>
              {stats && (
                <RankedList
                  rows={(['mobile', 'tablet', 'desktop'] as const).map((d) => ({
                    label: `${DEVICE_NAMES[d]} (${share(stats.devices.find((x) => x.device === d)?.views ?? 0, deviceTotal)}%)`,
                    value: stats.devices.find((x) => x.device === d)?.views ?? 0,
                  }))}
                  unit="Page views"
                  empty="No page views in this period yet."
                />
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTrafficPage;
