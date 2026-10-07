import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, FileClock, Map, MapPin, MessageSquareWarning, PartyPopper, Route, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AdminPageHeader, StatusPill } from '@/components/admin/adminUi';
import { formatAdminDate, formatAdminDateTime, labelFromId } from '@/components/admin/adminFormat';
import { ErrorState } from '@/components/ui/ErrorState';
import {
  auditApi,
  contentApi,
  feedbackApi,
  statsApi,
  usersApi,
  type AdminUser,
  type AuditEntry,
  type DashboardStats,
  type FeedbackItem,
} from '@/services/adminApi';
import type { DestinationRow, EventRow } from '@/services/content/resources';

interface DashboardData {
  stats: DashboardStats;
  recentUsers: AdminUser[];
  recentDestinations: DestinationRow[];
  upcomingEvents: EventRow[];
  recentFeedback: FeedbackItem[];
  recentActivity: AuditEntry[];
}

const newest = (pageSize: number, column = 'created_at') => ({ page: 1, pageSize, sort: { column, ascending: false } });

async function loadDashboard(): Promise<DashboardData> {
  const [stats, users, destinations, events, feedback, activity] = await Promise.all([
    statsApi.dashboard(),
    usersApi.list(newest(5)),
    contentApi.list('destinations', newest(5, 'updated_at'), []),
    contentApi.list('events', { page: 1, pageSize: 5, filters: { timing: 'upcoming', status: 'published' }, sort: { column: 'start_date', ascending: true } }, []),
    feedbackApi.list(newest(5)),
    auditApi.list(newest(6)),
  ]);
  return {
    stats,
    recentUsers: users.rows,
    recentDestinations: destinations.rows,
    upcomingEvents: events.rows,
    recentFeedback: feedback.rows,
    recentActivity: activity.rows,
  };
}

const card = 'rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#262B32]';
const monthLabel = (key: string) => new Date(`${key}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'short' });

const Panel: React.FC<{ title: string; to?: string; linkLabel?: string; children: React.ReactNode }> = ({ title, to, linkLabel, children }) => (
  <section className={`${card} p-5`}>
    <div className="flex items-center justify-between gap-3 mb-4">
      <h2 className="font-bold text-[#090C11] dark:text-white">{title}</h2>
      {to && (
        <Link to={to} className="inline-flex items-center gap-1 text-xs font-semibold text-[#757B81] hover:text-[#090C11] dark:hover:text-white">
          {linkLabel ?? 'View all'} <ArrowRight size={12} />
        </Link>
      )}
    </div>
    {children}
  </section>
);

const Empty: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="py-6 text-center text-sm text-[#757B81]">{children}</p>
);

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    setData(null);
    loadDashboard()
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not load the dashboard.'));
  }, []);

  useEffect(load, [load]);

  if (error) {
    return (
      <div>
        <AdminPageHeader title="Dashboard" description="An overview of the platform." />
        <div className={card}>
          <ErrorState title="Could not load the dashboard" message={error} onRetry={load} />
        </div>
      </div>
    );
  }

  const stats = data?.stats;
  const drafts = stats
    ? stats.content.destinations.draft + stats.content.events.draft + stats.content.festivals.draft + stats.content.transport_options.draft
    : 0;

  const tiles = stats
    ? [
        { label: 'Accounts', value: stats.users.total, note: `${stats.users.active} active · ${stats.users.newThisMonth} new this month`, icon: Users, to: '/admin/users' },
        { label: 'Destinations', value: stats.content.destinations.published, note: `published, of ${stats.content.destinations.total}`, icon: MapPin, to: '/admin/destinations' },
        { label: 'Festivals', value: stats.content.festivals.published, note: `published, of ${stats.content.festivals.total}`, icon: PartyPopper, to: '/admin/festivals' },
        { label: 'Upcoming events', value: stats.upcomingEvents, note: `of ${stats.content.events.total} events in total`, icon: Calendar, to: '/admin/events' },
        { label: 'Regions', value: stats.regions, note: 'with content assigned', icon: Map, to: '/admin/regions' },
        { label: 'Trips planned', value: stats.trips, note: 'by travellers, all time', icon: Route },
        { label: 'Feedback to review', value: stats.feedback.pending, note: `of ${stats.feedback.total} received`, icon: MessageSquareWarning, to: '/admin/feedback', alert: stats.feedback.pending > 0 },
        { label: 'Drafts', value: drafts, note: 'not yet published', icon: FileClock, alert: drafts > 0 },
      ]
    : [];

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Dashboard" description="What is on the platform right now, and what needs attention." />

      {/* Figures */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats
          ? tiles.map((tile) => {
              const body = (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#757B81]">{tile.label}</span>
                    <tile.icon size={16} className={tile.alert ? 'text-amber-500' : 'text-[#757B81]'} />
                  </div>
                  <p className="mt-2 text-3xl font-black text-[#090C11] dark:text-white">{tile.value.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-[#757B81]">{tile.note}</p>
                </>
              );
              return tile.to ? (
                <Link key={tile.label} to={tile.to} className={`${card} p-4 hover:border-[#FFD300] transition-colors`}>
                  {body}
                </Link>
              ) : (
                <div key={tile.label} className={`${card} p-4`}>
                  {body}
                </div>
              );
            })
          : Array.from({ length: 8 }).map((_, i) => <div key={i} className={`${card} h-28 animate-pulse`} aria-hidden="true" />)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <section className={`${card} p-5 xl:col-span-2`}>
          <h2 className="font-bold text-[#090C11] dark:text-white">Content by region</h2>
          <p className="text-xs text-[#757B81] mb-4">Shows which regions are thin on destinations, festivals or events.</p>
          <div className="h-72">
            {stats ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byRegion} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#757B8133" />
                  <XAxis dataKey="name" interval={0} angle={-40} textAnchor="end" height={78} tick={{ fontSize: 11, fill: '#757B81' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#757B81' }} />
                  <Tooltip cursor={{ fill: '#757B8118' }} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Legend verticalAlign="top" height={28} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="destinations" name="Destinations" stackId="content" fill="#2563EB" isAnimationActive={false} />
                  <Bar dataKey="festivals" name="Festivals" stackId="content" fill="#FFD300" isAnimationActive={false} />
                  <Bar dataKey="events" name="Events" stackId="content" fill="#059669" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" aria-hidden="true" />
            )}
          </div>
        </section>

        <section className={`${card} p-5`}>
          <h2 className="font-bold text-[#090C11] dark:text-white">New accounts</h2>
          <p className="text-xs text-[#757B81] mb-4">Sign-ups in each of the last six months.</p>
          <div className="h-72">
            {stats ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.signupsByMonth.map((m) => ({ ...m, label: monthLabel(m.month) }))} margin={{ top: 4, right: 8, bottom: 0, left: -24 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#757B8133" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#757B81' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#757B81' }} />
                  <Tooltip cursor={{ fill: '#757B8118' }} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="users" name="New accounts" fill="#FFD300" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" aria-hidden="true" />
            )}
          </div>
        </section>
      </div>

      {/* Recent things */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <Panel title="Trip planner, last 30 days">
            {data.stats.planner.total === 0 ? (
              <Empty>No trips have been planned in the last 30 days.</Empty>
            ) : (
              <>
                <dl className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
                  {(
                    [
                      ['Plans produced', String(data.stats.planner.total)],
                      ['Written by the AI planner', String(data.stats.planner.ai)],
                      ['Assembled from the catalogue', String(data.stats.planner.catalogue)],
                      ['Started from a description', String(data.stats.planner.fromDescription)],
                      [
                        'Activities tied to a catalogue record',
                        data.stats.planner.activityItems > 0
                          ? `${data.stats.planner.groundedItems} of ${data.stats.planner.activityItems} (${Math.round((data.stats.planner.groundedItems / data.stats.planner.activityItems) * 100)}%)`
                          : 'None yet',
                      ],
                      ['Average time to plan', `${(data.stats.planner.averageMs / 1000).toFixed(1)} s`],
                      ...(data.stats.planner.ai > 0 ? [['Average time, AI plans', `${(data.stats.planner.averageAiMs / 1000).toFixed(1)} s`]] : []),
                    ] as [string, string][]
                  ).map(([label, value]) => (
                    <div key={label} className="py-2.5 flex items-center justify-between gap-3">
                      <dt className="text-[#757B81] dark:text-white/70">{label}</dt>
                      <dd className="font-semibold whitespace-nowrap">{value}</dd>
                    </div>
                  ))}
                </dl>
                {data.stats.planner.ai === 0 && (
                  <p className="pt-3 text-xs text-[#757B81]">
                    No plan has come from the AI planner in this period. If that is unexpected, check that GEMINI_API_KEY is set for the site and look at the function's log.
                  </p>
                )}
              </>
            )}
          </Panel>

          <Panel title="Most-viewed destinations">
            {data.stats.mostViewed.length === 0 ? (
              <Empty>No destination pages have been opened in the last 30 days.</Empty>
            ) : (
              <>
                <ol className="divide-y divide-gray-100 dark:divide-white/5">
                  {data.stats.mostViewed.map((item, index) => (
                    <li key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 flex items-center gap-2.5">
                        <span className="w-5 text-xs font-bold text-[#757B81]">{index + 1}</span>
                        <Link to={`/explore/${item.id}`} className="font-semibold truncate hover:underline">
                          {item.name}
                        </Link>
                      </span>
                      <span className="text-xs text-[#757B81] whitespace-nowrap">
                        {item.views} {item.views === 1 ? 'view' : 'views'}
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="pt-3 text-xs text-[#757B81]">
                  {data.stats.viewsLast30Days} destination page {data.stats.viewsLast30Days === 1 ? 'view' : 'views'} in the last 30 days. A page reopened in the same visit is counted once.
                </p>
              </>
            )}
          </Panel>

          <Panel title="Upcoming events" to="/admin/events">
            {data.upcomingEvents.length === 0 ? (
              <Empty>No published events are coming up.</Empty>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-white/5">
                {data.upcomingEvents.map((event) => (
                  <li key={event.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0">
                      <span className="block font-semibold truncate">{event.name}</span>
                      <span className="block text-xs text-[#757B81] truncate">{event.location}</span>
                    </span>
                    <span className="text-xs text-[#757B81] whitespace-nowrap">{formatAdminDate(event.start_date)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Recently updated destinations" to="/admin/destinations">
            {data.recentDestinations.length === 0 ? (
              <Empty>No destinations yet.</Empty>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-white/5">
                {data.recentDestinations.map((destination) => (
                  <li key={destination.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0">
                      <span className="block font-semibold truncate">{destination.name}</span>
                      <span className="block text-xs text-[#757B81]">{labelFromId(destination.region_id)} · {formatAdminDate(destination.updated_at)}</span>
                    </span>
                    <StatusPill status={destination.status} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Newest accounts" to="/admin/users">
            {data.recentUsers.length === 0 ? (
              <Empty>No accounts yet.</Empty>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-white/5">
                {data.recentUsers.map((user) => (
                  <li key={user.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0">
                      <span className="block font-semibold truncate">{user.name}</span>
                      <span className="block text-xs text-[#757B81] truncate">{user.email}</span>
                    </span>
                    <span className="text-xs text-[#757B81] whitespace-nowrap">{formatAdminDate(user.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Latest feedback" to="/admin/feedback">
            {data.recentFeedback.length === 0 ? (
              <Empty>No feedback has been sent in yet.</Empty>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-white/5">
                {data.recentFeedback.map((item) => (
                  <li key={item.id} className="py-2.5 flex items-start justify-between gap-3 text-sm">
                    <span className="min-w-0">
                      <span className="block line-clamp-2">{item.message}</span>
                      <span className="block text-xs text-[#757B81] truncate">
                        {item.userName}
                        {item.subjectName && ` · ${item.subjectName}`}
                      </span>
                    </span>
                    <StatusPill status={item.status} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <div className="lg:col-span-2">
            <Panel title="Recent admin activity" to="/admin/audit" linkLabel="Audit log">
              {data.recentActivity.length === 0 ? (
                <Empty>Nothing has been changed yet.</Empty>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-white/5">
                  {data.recentActivity.map((entry) => (
                    <li key={entry.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0">
                        <span className="font-semibold">{labelFromId(entry.action)}</span>
                        {entry.summary && <span className="text-[#757B81]"> · {entry.summary}</span>}
                        <span className="block text-xs text-[#757B81] truncate">{entry.actorEmail}</span>
                      </span>
                      <span className="text-xs text-[#757B81] whitespace-nowrap">{formatAdminDateTime(entry.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
