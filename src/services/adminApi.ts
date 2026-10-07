import type { AccountStatus, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';
import { authService } from '@/services/authService';
import { hydrateContent } from '@/services/content/contentStore';
import { localDb, type LocalFeedbackRow } from '@/services/content/localDb';
import type { ContentStatus, ContentTable, RowByTable } from '@/services/content/resources';
import { localDestinationViews } from '@/services/viewService';

// Everything the admin area asks of the backend, and the feedback form on the
// public site. With Supabase connected each call goes to the database, where
// row-level security and the admin functions decide whether it is allowed.
// Without it, the same calls run against the local stand-in (localDb).

// ─── Errors ───────────────────────────────────────────────────────────────────

export type ApiErrorKind = 'unauthorized' | 'forbidden' | 'conflict' | 'invalid' | 'not-found' | 'failed';

export class ApiError extends Error {
  kind: ApiErrorKind;
  /** The form field the problem belongs to, when the backend can tell */
  field?: string;

  constructor(kind: ApiErrorKind, message: string, field?: string) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.field = field;
  }
}

interface BackendError {
  code?: string;
  message: string;
  details?: string | null;
}

/** Turns a database error into something an administrator can act on. */
function toApiError(error: BackendError): ApiError {
  const { code, message, details } = error;
  switch (code) {
    case '23505': {
      const field = /Key \(([a-z_]+)\)/.exec(details ?? '')?.[1];
      return new ApiError('conflict', `Another record already uses that ${field ?? 'value'}.`, field);
    }
    case '23503':
      return new ApiError('invalid', 'That refers to a record that does not exist.', 'region_id');
    case '23514':
    case '22023':
    case '22P02':
    case '23502':
      return new ApiError('invalid', 'One of the values is not allowed. Check the form and try again.');
    case 'P0002':
    case 'PGRST116':
      return new ApiError('not-found', 'That record was not found, or you do not have permission to change it.');
    case '42501':
      // The admin functions raise this with a message written for people; row-level security does not
      return new ApiError(
        'forbidden',
        /row-level security|permission denied/i.test(message) ? 'You do not have permission to do that.' : message,
      );
    case 'PGRST301':
    case '401':
      return new ApiError('unauthorized', 'Your session has expired. Please log in again.');
    default:
      return new ApiError('failed', message || 'Something went wrong. Please try again.');
  }
}

/** Local fallback: the signed-in administrator, or an error matching what the database would return. */
function requireLocalAdmin() {
  const user = authService.getCurrentUser();
  if (!user) throw new ApiError('unauthorized', 'Please log in to continue.');
  if (user.role !== 'admin' || user.status === 'suspended') {
    throw new ApiError('forbidden', 'You do not have permission to do that.');
  }
  return user;
}

// ─── Lists ────────────────────────────────────────────────────────────────────

export interface ListParams {
  page: number;
  pageSize: number;
  search?: string;
  /** Exact-match filters by column; empty values are ignored */
  filters?: Record<string, string>;
  sort?: { column: string; ascending: boolean };
}

export interface Page<T> {
  rows: T[];
  total: number;
}

/** Event timing filter values, relative to today. */
export type EventTiming = 'upcoming' | 'ongoing' | 'past';
const TIMING_FILTER = 'timing';

const todayIso = () => new Date().toISOString().slice(0, 10);

// PostgREST reads , ( ) as filter syntax, and % * as wildcards
const cleanSearch = (search = '') => search.replace(/[,()%*\\"']/g, ' ').trim();

type Query = {
  or(filters: string): Query;
  eq(column: string, value: string): Query;
  gt(column: string, value: string): Query;
  lt(column: string, value: string): Query;
  lte(column: string, value: string): Query;
  gte(column: string, value: string): Query;
  order(column: string, options: { ascending: boolean }): Query;
  range(from: number, to: number): Query;
};

/** Applies search, filters, sort and paging to a database query. */
function applyListParams<Q>(query: Q, params: ListParams, searchColumns: string[]): Q {
  let q = query as unknown as Query;
  const term = cleanSearch(params.search);
  if (term && searchColumns.length > 0) {
    q = q.or(searchColumns.map((c) => `${c}.ilike.%${term}%`).join(','));
  }
  for (const [column, value] of Object.entries(params.filters ?? {})) {
    if (!value) continue;
    if (column === TIMING_FILTER) {
      const today = todayIso();
      if (value === 'upcoming') q = q.gt('start_date', today);
      else if (value === 'past') q = q.lt('end_date', today);
      else q = q.lte('start_date', today).gte('end_date', today);
    } else {
      q = q.eq(column, value);
    }
  }
  if (params.sort) q = q.order(params.sort.column, { ascending: params.sort.ascending });
  const from = (params.page - 1) * params.pageSize;
  return q.range(from, from + params.pageSize - 1) as unknown as Q;
}

/** The same list behaviour for the local fallback. */
function listLocal<T extends object>(all: T[], params: ListParams, searchColumns: string[]): Page<T> {
  const value = (row: T, column: string) => (row as Record<string, unknown>)[column];
  const term = cleanSearch(params.search).toLowerCase();
  const today = todayIso();

  let rows = all.filter((row) => {
    if (term && !searchColumns.some((c) => String(value(row, c) ?? '').toLowerCase().includes(term))) return false;
    for (const [column, wanted] of Object.entries(params.filters ?? {})) {
      if (!wanted) continue;
      if (column === TIMING_FILTER) {
        const start = String(value(row, 'start_date'));
        const end = String(value(row, 'end_date'));
        const timing = start > today ? 'upcoming' : end < today ? 'past' : 'ongoing';
        if (timing !== wanted) return false;
      } else if (String(value(row, column)) !== wanted) {
        return false;
      }
    }
    return true;
  });

  if (params.sort) {
    const { column, ascending } = params.sort;
    rows = [...rows].sort((a, b) => {
      const x = value(a, column);
      const y = value(b, column);
      const order =
        typeof x === 'number' && typeof y === 'number' ? x - y : String(x ?? '').localeCompare(String(y ?? ''));
      return ascending ? order : -order;
    });
  }

  const from = (params.page - 1) * params.pageSize;
  return { rows: rows.slice(from, from + params.pageSize), total: rows.length };
}

// ─── Content ──────────────────────────────────────────────────────────────────

/** Fields the database sets itself; a client must never send them. */
const SERVER_OWNED = ['created_at', 'updated_at', 'archived_at'] as const;

function withoutServerFields<T extends object>(row: T): T {
  const copy = { ...row } as Record<string, unknown>;
  for (const key of SERVER_OWNED) delete copy[key];
  return copy as T;
}

type StatusRow = { status?: ContentStatus; featured?: boolean };

/** Mirrors the database's audit trigger, so both backends log the same action names. */
function describeChange(before: StatusRow, after: StatusRow): string {
  if (after.status !== before.status) {
    if (after.status === 'archived') return 'archived';
    if (before.status === 'archived') return 'restored';
    return after.status === 'published' ? 'published' : 'unpublished';
  }
  if (after.featured !== before.featured) return after.featured ? 'featured' : 'unfeatured';
  return 'updated';
}

export const contentApi = {
  async list<T extends ContentTable>(table: T, params: ListParams, searchColumns: string[]): Promise<Page<RowByTable[T]>> {
    if (supabase) {
      const query = applyListParams(supabase.from(table).select('*', { count: 'exact' }), params, searchColumns);
      const { data, error, count } = await query;
      if (error) throw toApiError(error);
      return { rows: (data ?? []) as RowByTable[T][], total: count ?? 0 };
    }
    requireLocalAdmin();
    return listLocal(localDb.rows(table), params, searchColumns);
  },

  async create<T extends ContentTable>(table: T, row: Partial<RowByTable[T]> & { id: string; name: string }): Promise<RowByTable[T]> {
    const payload = withoutServerFields(row);

    if (supabase) {
      const { data, error } = await supabase.from(table).insert(payload).select('*').single();
      if (error) throw toApiError(error);
      await hydrateContent();
      return data as RowByTable[T];
    }

    const admin = requireLocalAdmin();
    const rows = localDb.rows(table);
    if (rows.some((r) => r.id === row.id)) {
      throw new ApiError('conflict', 'Another record already uses that name. Change it slightly and try again.', 'name');
    }
    const slug = (row as { slug?: string }).slug;
    if (slug && rows.some((r) => (r as { slug?: string }).slug === slug)) {
      throw new ApiError('conflict', 'Another record already uses that slug.', 'slug');
    }
    const regionId = (row as { region_id?: string }).region_id;
    if (regionId && !localDb.rows('regions').some((r) => r.id === regionId)) {
      throw new ApiError('invalid', 'That region does not exist.', 'region_id');
    }

    const now = new Date().toISOString();
    const created = {
      position: 1000,
      ...payload,
      created_at: now,
      updated_at: now,
      ...(table === 'regions' ? {} : { archived_at: (row as StatusRow).status === 'archived' ? now : null }),
    } as unknown as RowByTable[T];
    localDb.write(table, [...rows, created]);
    localDb.addAudit({ actor_id: admin.id, actor_email: admin.email, action: 'created', resource: table, resource_id: created.id, summary: created.name });
    await hydrateContent();
    return created;
  },

  async update<T extends ContentTable>(table: T, id: string, patch: Partial<RowByTable[T]>): Promise<RowByTable[T]> {
    // The id is the record's identity and is never rewritten
    const payload = withoutServerFields(patch) as Record<string, unknown>;
    delete payload.id;

    if (supabase) {
      const { data, error } = await supabase.from(table).update(payload).eq('id', id).select('*').single();
      if (error) throw toApiError(error);
      await hydrateContent();
      return data as RowByTable[T];
    }

    const admin = requireLocalAdmin();
    const rows = localDb.rows(table);
    const before = rows.find((r) => r.id === id);
    if (!before) throw new ApiError('not-found', 'That record was not found.');
    const slug = payload.slug as string | undefined;
    if (slug && rows.some((r) => r.id !== id && (r as { slug?: string }).slug === slug)) {
      throw new ApiError('conflict', 'Another record already uses that slug.', 'slug');
    }

    const now = new Date().toISOString();
    const after = { ...before, ...payload, updated_at: now } as RowByTable[T] & StatusRow & { archived_at?: string | null };
    if (table !== 'regions') {
      const wasArchived = (before as StatusRow).status === 'archived';
      after.archived_at = after.status === 'archived' ? (wasArchived ? (before as { archived_at: string | null }).archived_at : now) : null;
    }
    localDb.write(table, rows.map((r) => (r.id === id ? after : r)));
    localDb.addAudit({
      actor_id: admin.id,
      actor_email: admin.email,
      action: describeChange(before as StatusRow, after),
      resource: table,
      resource_id: id,
      summary: after.name,
    });
    await hydrateContent();
    return after;
  },
};

// ─── Accounts ─────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  avatar?: string;
  createdAt: string;
  /** How many trips the account has planned */
  trips: number;
}

interface ProfileListRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  avatar: string | null;
  created_at: string;
}

const toAdminUser = (row: ProfileListRow, trips: number): AdminUser => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  status: row.status,
  avatar: row.avatar ?? undefined,
  createdAt: row.created_at,
  trips,
});

/** Local fallback: accounts as profile rows, and trips per account. */
function localProfiles(): ProfileListRow[] {
  return authService._listLocalUsers().map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status ?? 'active',
    avatar: u.avatar ?? null,
    created_at: u.createdAt,
  }));
}

function localTripCounts(): Record<string, number> {
  try {
    const trips = JSON.parse(localStorage.getItem('yenkogh_trips') || '[]') as { userId: string }[];
    return trips.reduce<Record<string, number>>((acc, t) => ({ ...acc, [t.userId]: (acc[t.userId] ?? 0) + 1 }), {});
  } catch {
    return {};
  }
}

export const usersApi = {
  async list(params: ListParams): Promise<Page<AdminUser>> {
    const searchColumns = ['name', 'email'];

    if (supabase) {
      const query = applyListParams(
        supabase.from('profiles').select('id, name, email, role, status, avatar, created_at', { count: 'exact' }),
        params,
        searchColumns,
      );
      const { data, error, count } = await query;
      if (error) throw toApiError(error);
      const rows = (data ?? []) as ProfileListRow[];

      const trips: Record<string, number> = {};
      if (rows.length > 0) {
        const { data: counts, error: countError } = await supabase.rpc('admin_user_trip_counts', {
          p_user_ids: rows.map((r) => r.id),
        });
        if (countError) throw toApiError(countError);
        for (const c of (counts ?? []) as { user_id: string; trips: number }[]) trips[c.user_id] = Number(c.trips);
      }
      return { rows: rows.map((r) => toAdminUser(r, trips[r.id] ?? 0)), total: count ?? 0 };
    }

    requireLocalAdmin();
    const trips = localTripCounts();
    const page = listLocal(localProfiles(), params, searchColumns);
    return { rows: page.rows.map((r) => toAdminUser(r, trips[r.id] ?? 0)), total: page.total };
  },

  async setStatus(userId: string, status: AccountStatus): Promise<void> {
    if (supabase) {
      const { error } = await supabase.rpc('admin_set_user_status', { p_user_id: userId, p_status: status });
      if (error) throw toApiError(error);
      return;
    }
    const admin = requireLocalAdmin();
    if (userId === admin.id) throw new ApiError('forbidden', 'You cannot change your own account status.');
    const updated = authService._setLocalUserOverride(userId, { status });
    localDb.addAudit({
      actor_id: admin.id,
      actor_email: admin.email,
      action: status === 'suspended' ? 'suspended' : 'activated',
      resource: 'profiles',
      resource_id: userId,
      summary: updated.email,
    });
  },

  async setRole(userId: string, role: UserRole): Promise<void> {
    if (supabase) {
      const { error } = await supabase.rpc('admin_set_user_role', { p_user_id: userId, p_role: role });
      if (error) throw toApiError(error);
      return;
    }
    const admin = requireLocalAdmin();
    if (userId === admin.id) throw new ApiError('forbidden', 'You cannot change your own role.');
    const before = authService._listLocalUsers().find((u) => u.id === userId);
    const updated = authService._setLocalUserOverride(userId, { role });
    localDb.addAudit({
      actor_id: admin.id,
      actor_email: admin.email,
      action: 'role_changed',
      resource: 'profiles',
      resource_id: userId,
      summary: updated.email,
      metadata: { from: before?.role, to: role },
    });
  },
};

// ─── Feedback ─────────────────────────────────────────────────────────────────

export type FeedbackKind = 'correction' | 'report' | 'suggestion' | 'review';
export type FeedbackStatus = 'pending' | 'reviewed' | 'approved' | 'rejected' | 'resolved';
export type FeedbackSubject = 'destination' | 'event' | 'festival' | 'transport' | 'general';

export interface FeedbackItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  kind: FeedbackKind;
  subjectType: FeedbackSubject;
  subjectId: string | null;
  subjectName: string;
  message: string;
  status: FeedbackStatus;
  adminNote: string;
  reviewedAt: string | null;
  createdAt: string;
}

export const FEEDBACK_MESSAGE_LIMITS = { min: 10, max: 2000 };

const toFeedbackItem = (row: LocalFeedbackRow, people: Record<string, { name: string; email: string }>): FeedbackItem => ({
  id: row.id,
  userId: row.user_id,
  userName: people[row.user_id]?.name ?? 'Unknown account',
  userEmail: people[row.user_id]?.email ?? '',
  kind: row.kind as FeedbackKind,
  subjectType: row.subject_type as FeedbackSubject,
  subjectId: row.subject_id,
  subjectName: row.subject_name,
  message: row.message,
  status: row.status as FeedbackStatus,
  adminNote: row.admin_note,
  reviewedAt: row.reviewed_at,
  createdAt: row.created_at,
});

export const feedbackApi = {
  /** Sent by any signed-in traveller from the public site. */
  async submit(input: {
    kind: FeedbackKind;
    subjectType: FeedbackSubject;
    subjectId?: string;
    subjectName?: string;
    message: string;
  }): Promise<void> {
    const message = input.message.trim();
    if (message.length < FEEDBACK_MESSAGE_LIMITS.min || message.length > FEEDBACK_MESSAGE_LIMITS.max) {
      throw new ApiError(
        'invalid',
        `Please write between ${FEEDBACK_MESSAGE_LIMITS.min} and ${FEEDBACK_MESSAGE_LIMITS.max} characters.`,
        'message',
      );
    }
    const row = {
      kind: input.kind,
      subject_type: input.subjectType,
      subject_id: input.subjectId ?? null,
      subject_name: input.subjectName ?? '',
      message,
    };

    if (supabase) {
      const { error } = await supabase.from('feedback').insert(row);
      if (error) throw toApiError(error);
      return;
    }

    const user = authService.getCurrentUser();
    if (!user) throw new ApiError('unauthorized', 'Please log in to send feedback.');
    if (user.status === 'suspended') throw new ApiError('forbidden', 'You do not have permission to do that.');
    localDb.writeFeedback([
      ...localDb.feedback(),
      {
        ...row,
        id: `feedback-${Date.now()}`,
        user_id: user.id,
        status: 'pending',
        admin_note: '',
        reviewed_by: null,
        reviewed_at: null,
        created_at: new Date().toISOString(),
      },
    ]);
  },

  async list(params: ListParams): Promise<Page<FeedbackItem>> {
    const searchColumns = ['message', 'subject_name'];

    if (supabase) {
      const query = applyListParams(supabase.from('feedback').select('*', { count: 'exact' }), params, searchColumns);
      const { data, error, count } = await query;
      if (error) throw toApiError(error);
      const rows = (data ?? []) as LocalFeedbackRow[];

      // Feedback points at the auth user, so the sender's name is looked up separately
      const people: Record<string, { name: string; email: string }> = {};
      const ids = [...new Set(rows.map((r) => r.user_id))];
      if (ids.length > 0) {
        const { data: profiles, error: profileError } = await supabase.from('profiles').select('id, name, email').in('id', ids);
        if (profileError) throw toApiError(profileError);
        for (const p of (profiles ?? []) as { id: string; name: string; email: string }[]) people[p.id] = p;
      }
      return { rows: rows.map((r) => toFeedbackItem(r, people)), total: count ?? 0 };
    }

    requireLocalAdmin();
    const people = Object.fromEntries(authService._listLocalUsers().map((u) => [u.id, { name: u.name, email: u.email }]));
    const page = listLocal(localDb.feedback(), params, searchColumns);
    return { rows: page.rows.map((r) => toFeedbackItem(r, people)), total: page.total };
  },

  async moderate(id: string, status: FeedbackStatus, adminNote: string): Promise<void> {
    if (supabase) {
      // Only status and note are sent; the database keeps the traveller's words as written
      const { error } = await supabase
        .from('feedback')
        .update({ status, admin_note: adminNote.trim() })
        .eq('id', id)
        .select('id')
        .single();
      if (error) throw toApiError(error);
      return;
    }

    const admin = requireLocalAdmin();
    const rows = localDb.feedback();
    const before = rows.find((r) => r.id === id);
    if (!before) throw new ApiError('not-found', 'That submission was not found.');
    const changed = before.status !== status;
    localDb.writeFeedback(
      rows.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              admin_note: adminNote.trim(),
              ...(changed ? { reviewed_by: admin.id, reviewed_at: new Date().toISOString() } : {}),
            }
          : r,
      ),
    );
    if (changed) {
      localDb.addAudit({
        actor_id: admin.id,
        actor_email: admin.email,
        action: 'moderated',
        resource: 'feedback',
        resource_id: id,
        summary: before.message.slice(0, 80),
        metadata: { from: before.status, to: status },
      });
    }
  },
};

// ─── Audit log ────────────────────────────────────────────────────────────────

export interface AuditEntry {
  id: number;
  actorEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  summary: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

interface AuditRow {
  id: number;
  actor_email: string;
  action: string;
  resource: string;
  resource_id: string;
  summary: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const toAuditEntry = (row: AuditRow): AuditEntry => ({
  id: row.id,
  actorEmail: row.actor_email,
  action: row.action,
  resource: row.resource,
  resourceId: row.resource_id,
  summary: row.summary,
  metadata: row.metadata ?? {},
  createdAt: row.created_at,
});

export const auditApi = {
  async list(params: ListParams): Promise<Page<AuditEntry>> {
    const searchColumns = ['summary', 'actor_email'];

    if (supabase) {
      const query = applyListParams(supabase.from('audit_log').select('*', { count: 'exact' }), params, searchColumns);
      const { data, error, count } = await query;
      if (error) throw toApiError(error);
      return { rows: ((data ?? []) as AuditRow[]).map(toAuditEntry), total: count ?? 0 };
    }

    requireLocalAdmin();
    const page = listLocal(localDb.audit(), params, searchColumns);
    return { rows: page.rows.map(toAuditEntry), total: page.total };
  },

  /** Records an administrator opening the admin area. The backend ignores it for anyone else. */
  async logAdminLogin(): Promise<void> {
    if (supabase) {
      await supabase.rpc('log_admin_login');
      return;
    }
    const user = authService.getCurrentUser();
    if (user?.role !== 'admin') return;
    localDb.addAudit({
      actor_id: user.id,
      actor_email: user.email,
      action: 'admin_login',
      resource: 'session',
      resource_id: '',
      summary: 'Opened the admin area',
    });
  },
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface StatusCounts {
  total: number;
  published: number;
  draft: number;
  archived: number;
}

export interface DashboardStats {
  users: { total: number; active: number; suspended: number; admins: number; newThisMonth: number };
  content: Record<'destinations' | 'events' | 'festivals' | 'transport_options', StatusCounts>;
  regions: number;
  upcomingEvents: number;
  trips: number;
  feedback: { total: number; pending: number };
  byRegion: { name: string; destinations: number; festivals: number; events: number }[];
  signupsByMonth: { month: string; users: number }[];
  /** Destination pages opened most in the last 30 days, busiest first */
  mostViewed: { id: string; name: string; views: number }[];
  viewsLast30Days: number;
}

function localStats(): DashboardStats {
  const counts = (table: 'destinations' | 'events' | 'festivals' | 'transport_options'): StatusCounts => {
    const rows = localDb.rows(table);
    return {
      total: rows.length,
      published: rows.filter((r) => r.status === 'published').length,
      draft: rows.filter((r) => r.status === 'draft').length,
      archived: rows.filter((r) => r.status === 'archived').length,
    };
  };
  const profiles = localProfiles();
  const now = new Date();
  const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  const months = Array.from({ length: 6 }, (_, i) => monthKey(new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)));
  const live = <T extends { status: ContentStatus }>(rows: T[]) => rows.filter((r) => r.status !== 'archived');
  const today = todayIso();

  const since = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
  const viewed = Object.entries(localDestinationViews())
    .map(([id, days]) => ({
      id,
      name: localDb.rows('destinations').find((d) => d.id === id)?.name ?? id,
      views: Object.entries(days).reduce((sum, [day, n]) => sum + (day >= since ? n : 0), 0),
    }))
    .filter((v) => v.views > 0)
    .sort((a, b) => b.views - a.views || a.name.localeCompare(b.name));

  return {
    users: {
      total: profiles.length,
      active: profiles.filter((p) => p.status === 'active').length,
      suspended: profiles.filter((p) => p.status === 'suspended').length,
      admins: profiles.filter((p) => p.role === 'admin').length,
      newThisMonth: profiles.filter((p) => monthKey(new Date(p.created_at)) === monthKey(now)).length,
    },
    content: {
      destinations: counts('destinations'),
      events: counts('events'),
      festivals: counts('festivals'),
      transport_options: counts('transport_options'),
    },
    regions: localDb.rows('regions').length,
    upcomingEvents: localDb.rows('events').filter((e) => e.status === 'published' && e.end_date >= today).length,
    trips: Object.values(localTripCounts()).reduce((a, b) => a + b, 0),
    feedback: {
      total: localDb.feedback().length,
      pending: localDb.feedback().filter((f) => f.status === 'pending').length,
    },
    byRegion: [...localDb.rows('regions')]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((g) => ({
        name: g.name,
        destinations: live(localDb.rows('destinations')).filter((d) => d.region_id === g.id).length,
        festivals: live(localDb.rows('festivals')).filter((f) => f.region_id === g.id).length,
        events: live(localDb.rows('events')).filter((e) => e.region_id === g.id).length,
      })),
    signupsByMonth: months.map((month) => ({
      month,
      users: profiles.filter((p) => monthKey(new Date(p.created_at)) === month).length,
    })),
    mostViewed: viewed.slice(0, 5),
    viewsLast30Days: viewed.reduce((sum, v) => sum + v.views, 0),
  };
}

export const statsApi = {
  async dashboard(): Promise<DashboardStats> {
    if (supabase) {
      const { data, error } = await supabase.rpc('admin_dashboard_stats');
      if (error) throw toApiError(error);
      // A database set up before view counting was added does not send these yet
      return { mostViewed: [], viewsLast30Days: 0, ...(data as Partial<DashboardStats>) } as DashboardStats;
    }
    requireLocalAdmin();
    return localStats();
  },
};

// ─── Media ────────────────────────────────────────────────────────────────────

export const IMAGE_RULES = {
  types: ['image/jpeg', 'image/png', 'image/webp'],
  maxBytes: 5 * 1024 * 1024,
};

/** Why a file cannot be uploaded, or null when it is acceptable. */
export function validateImageFile(file: File): string | null {
  if (!IMAGE_RULES.types.includes(file.type)) return 'Choose a JPEG, PNG or WebP image.';
  if (file.size > IMAGE_RULES.maxBytes) return 'That image is larger than 5 MB. Choose a smaller one.';
  return null;
}

const MEDIA_BUCKET = 'media';
const EXTENSIONS: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export const mediaApi = {
  /** Uploads need the storage bucket, so they are only offered with the backend connected. */
  canUpload: supabase !== null,

  /** Stores an image and returns its public address. The bucket re-checks type and size. */
  async uploadImage(file: File, folder: ContentTable): Promise<string> {
    const problem = validateImageFile(file);
    if (problem) throw new ApiError('invalid', problem);
    if (!supabase) throw new ApiError('failed', 'Uploads are available once the database is connected. Paste an image link instead.');

    // The name is generated here, so nothing a person typed ends up in the path
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${EXTENSIONS[file.type]}`;
    const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw new ApiError('failed', error.message);
    return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
  },

  /** Removes an image this app uploaded. Links to images hosted elsewhere are left alone. */
  async removeImage(url: string): Promise<void> {
    if (!supabase) return;
    const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
    const at = url.indexOf(marker);
    if (at === -1) return;
    await supabase.storage.from(MEDIA_BUCKET).remove([url.slice(at + marker.length)]);
  },
};
