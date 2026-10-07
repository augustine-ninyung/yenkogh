-- YenkoGH content and administration schema (Supabase / Postgres)
--
-- Run AFTER schema.sql, then run seed.sql to load the starting content.
-- Safe to run again; every statement is written to be repeatable.
--
-- What this adds:
--   * content tables the admin area manages: regions, destinations, events,
--     festivals and transport options
--   * feedback from travellers, for moderation
--   * an audit log written by triggers, so no client can skip or forge it
--   * account suspension, and admin-only functions for managing accounts
--
-- Who may do what is decided here, in the database. The browser cannot grant
-- itself anything: every admin write is checked by public.is_admin().

-- ─── Accounts: status ────────────────────────────────────────────────────────

alter table public.profiles
  add column if not exists status text not null default 'active';

do $$ begin
  alter table public.profiles add constraint profiles_status_check check (status in ('active', 'suspended'));
exception when duplicate_object then null; end $$;

-- A suspended admin is not an admin.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

create or replace function public.is_active()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and status = 'active');
$$;

-- Suspended accounts keep read access to their own data but cannot change it.
drop policy if exists "trips: owner only" on public.trips;
create policy "trips: owner only" on public.trips
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and public.is_active());

drop policy if exists "budgets: owner only" on public.budgets;
create policy "budgets: owner only" on public.budgets
  for all to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and public.is_active()
    and (
      trip_id is null
      or exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
    )
  );

-- ─── Shared pieces ───────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ─── Regions ─────────────────────────────────────────────────────────────────
-- Ghana's regions. Destinations, events and festivals each point at one, so a
-- region's name lives in exactly one place.

create table if not exists public.regions (
  id          text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  -- Order on the public site; lower comes first. New rows go after the seeded ones.
  position integer not null default 1000,
  name        text not null unique check (char_length(name) between 2 and 60),
  code        text not null unique check (char_length(code) between 2 and 5),
  capital     text not null default '' check (char_length(capital) <= 60),
  description text not null default '' check (char_length(description) <= 2000),
  image_url   text not null default '' check (image_url = '' or image_url ~ '^https?://'),
  color       text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── Destinations ────────────────────────────────────────────────────────────
-- Columns hold what is searched, filtered and sorted. `details` holds the rest
-- of a destination's page (gallery, activities, opening hours, tips and so on).

create table if not exists public.destinations (
  id                text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  -- Order on the public site; lower comes first. New rows go after the seeded ones.
  position integer not null default 1000,
  slug              text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name              text not null check (char_length(name) between 2 and 120),
  region_id         text not null references public.regions (id) on update cascade,
  type              text not null check (type in (
                      'beach', 'national-park', 'historical', 'waterfall', 'cultural',
                      'city', 'lake', 'wildlife', 'botanical', 'religious')),
  short_description text not null default '' check (char_length(short_description) <= 300),
  description       text not null default '' check (char_length(description) <= 5000),
  image_url         text not null default '' check (image_url = '' or image_url ~ '^https?://'),
  estimated_cost    numeric(10, 2) not null default 0 check (estimated_cost >= 0),
  rating            numeric(2, 1) not null default 0 check (rating between 0 and 5),
  review_count      integer not null default 0 check (review_count >= 0),
  featured          boolean not null default false,
  status            text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  details           jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  archived_at       timestamptz
);

create index if not exists destinations_region_idx on public.destinations (region_id);
create index if not exists destinations_status_idx on public.destinations (status);

-- ─── Events ──────────────────────────────────────────────────────────────────
-- Dated happenings: this year's edition of a festival, a concert, a food fair.

create table if not exists public.events (
  id                text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  -- Order on the public site; lower comes first. New rows go after the seeded ones.
  position integer not null default 1000,
  slug              text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name              text not null check (char_length(name) between 2 and 120),
  region_id         text not null references public.regions (id) on update cascade,
  category          text not null check (category in (
                      'festival', 'cultural', 'music', 'food', 'sports', 'art', 'religious', 'traditional')),
  location          text not null default '' check (char_length(location) <= 120),
  start_date        date not null,
  end_date          date not null,
  is_free           boolean not null default true,
  ticket_price      numeric(10, 2) check (ticket_price is null or ticket_price >= 0),
  short_description text not null default '' check (char_length(short_description) <= 300),
  description       text not null default '' check (char_length(description) <= 5000),
  image_url         text not null default '' check (image_url = '' or image_url ~ '^https?://'),
  featured          boolean not null default false,
  status            text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  details           jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  archived_at       timestamptz,
  check (end_date >= start_date)
);

create index if not exists events_region_idx on public.events (region_id);
create index if not exists events_start_date_idx on public.events (start_date);

-- ─── Festivals ───────────────────────────────────────────────────────────────
-- The catalogue of traditional festivals. These recur every year but not on a
-- fixed date, so the usual month is free text ("August – September", or a
-- lunar month) and a given year's dates belong in `events`.

create table if not exists public.festivals (
  id           text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  -- Order on the public site; lower comes first. New rows go after the seeded ones.
  position integer not null default 1000,
  name         text not null check (char_length(name) between 2 and 120),
  region_id    text not null references public.regions (id) on update cascade,
  category     text not null check (category in (
                 'harvest', 'migration', 'purification', 'ancestral', 'war-commemoration', 'initiation',
                 'religious', 'fire', 'fishing', 'hunting', 'heritage', 'arts', 'development')),
  town         text not null default '' check (char_length(town) <= 160),
  ethnic_group text not null default '' check (char_length(ethnic_group) <= 120),
  month        text not null default '' check (char_length(month) <= 120),
  description  text not null default '' check (char_length(description) <= 5000),
  image_url    text not null default '' check (image_url = '' or image_url ~ '^https?://'),
  completeness text not null default 'basic' check (completeness in ('detailed', 'basic', 'name-only')),
  featured     boolean not null default false,
  status       text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  details      jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  archived_at  timestamptz
);

create index if not exists festivals_region_idx on public.festivals (region_id);

-- ─── Transport options ───────────────────────────────────────────────────────
-- One row per way of getting around. `details` holds its providers, safety
-- tips and routes; each route has from, to, duration, a fare range, frequency.

create table if not exists public.transport_options (
  id          text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  -- Order on the public site; lower comes first. New rows go after the seeded ones.
  position integer not null default 1000,
  name        text not null check (char_length(name) between 2 and 120),
  type        text not null check (type in (
                'bus', 'taxi', 'ride-hailing', 'train', 'domestic-flight', 'boat',
                'private-vehicle', 'trotro', 'shared-taxi')),
  description text not null default '' check (char_length(description) <= 5000),
  image_url   text not null default '' check (image_url = '' or image_url ~ '^https?://'),
  status      text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  details     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  archived_at timestamptz
);

-- ─── Feedback ────────────────────────────────────────────────────────────────
-- Corrections, reports and suggestions sent in by travellers. Rows are never
-- deleted: moderation changes the status and records who handled it.

create table if not exists public.feedback (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind         text not null check (kind in ('correction', 'report', 'suggestion', 'review')),
  subject_type text not null default 'general'
                 check (subject_type in ('destination', 'event', 'festival', 'transport', 'general')),
  subject_id   text,
  subject_name text not null default '' check (char_length(subject_name) <= 160),
  message      text not null check (char_length(btrim(message)) between 10 and 2000),
  status       text not null default 'pending'
                 check (status in ('pending', 'reviewed', 'approved', 'rejected', 'resolved')),
  admin_note   text not null default '' check (char_length(admin_note) <= 1000),
  reviewed_by  uuid references auth.users (id) on delete set null,
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists feedback_status_idx on public.feedback (status);
create index if not exists feedback_user_idx on public.feedback (user_id);

-- ─── Audit log ───────────────────────────────────────────────────────────────
-- Written only by the triggers and functions below. Nobody can insert, change
-- or delete rows through the API, admins included.

create table if not exists public.audit_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid,
  actor_email text not null default '',
  action      text not null,
  resource    text not null,
  resource_id text not null default '',
  summary     text not null default '',
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists audit_log_created_idx on public.audit_log (created_at desc);

create or replace function public.write_audit(
  p_action text, p_resource text, p_resource_id text, p_summary text, p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Changes made outside the app (seeding, the SQL editor) have no signed-in actor
  if auth.uid() is null then
    return;
  end if;
  insert into public.audit_log (actor_id, actor_email, action, resource, resource_id, summary, metadata)
  values (
    auth.uid(),
    coalesce((select email from public.profiles where id = auth.uid()), ''),
    p_action, p_resource, p_resource_id, p_summary, p_metadata
  );
end;
$$;

revoke all on function public.write_audit(text, text, text, text, jsonb) from public, anon, authenticated;

-- Content tables: record what kind of change each write was.
create or replace function public.audit_content()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action text;
  v_new jsonb := to_jsonb(new);
  v_old jsonb := case when tg_op = 'UPDATE' then to_jsonb(old) else '{}'::jsonb end;
begin
  if tg_op = 'INSERT' then
    v_action := 'created';
  elsif v_new ? 'status' and v_new ->> 'status' is distinct from v_old ->> 'status' then
    v_action := case v_new ->> 'status'
      when 'archived' then 'archived'
      when 'published' then case when v_old ->> 'status' = 'archived' then 'restored' else 'published' end
      else case when v_old ->> 'status' = 'archived' then 'restored' else 'unpublished' end
    end;
  elsif v_new ? 'featured' and v_new ->> 'featured' is distinct from v_old ->> 'featured' then
    v_action := case when (v_new ->> 'featured')::boolean then 'featured' else 'unfeatured' end;
  else
    v_action := 'updated';
  end if;

  perform public.write_audit(v_action, tg_table_name, v_new ->> 'id', v_new ->> 'name');
  return new;
end;
$$;

-- ─── Triggers ────────────────────────────────────────────────────────────────

do $$
declare
  t text;
begin
  foreach t in array array['regions', 'destinations', 'events', 'festivals', 'transport_options'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
    execute format('drop trigger if exists audit_content on public.%I', t);
    execute format(
      'create trigger audit_content after insert or update on public.%I for each row execute function public.audit_content()', t);
  end loop;
end $$;

-- Archiving stamps the time; restoring clears it.
create or replace function public.stamp_archived_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'archived' and (tg_op = 'INSERT' or old.status is distinct from 'archived') then
    new.archived_at := now();
  elsif new.status <> 'archived' then
    new.archived_at := null;
  end if;
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['destinations', 'events', 'festivals', 'transport_options'] loop
    execute format('drop trigger if exists stamp_archived_at on public.%I', t);
    execute format(
      'create trigger stamp_archived_at before insert or update on public.%I for each row execute function public.stamp_archived_at()', t);
  end loop;
end $$;

-- Feedback moderation is audited, and stamped with who handled it.
create or replace function public.moderate_feedback()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    new.reviewed_by := auth.uid();
    new.reviewed_at := now();
    perform public.write_audit(
      'moderated', 'feedback', new.id::text,
      left(new.message, 80),
      jsonb_build_object('from', old.status, 'to', new.status)
    );
  end if;
  -- What the traveller wrote is never rewritten by moderation
  new.user_id := old.user_id;
  new.kind := old.kind;
  new.message := old.message;
  new.subject_type := old.subject_type;
  new.subject_id := old.subject_id;
  new.subject_name := old.subject_name;
  new.created_at := old.created_at;
  return new;
end;
$$;

drop trigger if exists moderate_feedback on public.feedback;
create trigger moderate_feedback
  before update on public.feedback
  for each row execute function public.moderate_feedback();

-- ─── Row-level security ──────────────────────────────────────────────────────
-- Content: anyone may read what is published; only admins see drafts and
-- archived rows, and only admins write. There is deliberately no delete
-- policy: content is archived, never destroyed, through the API.

alter table public.regions           enable row level security;
alter table public.destinations      enable row level security;
alter table public.events            enable row level security;
alter table public.festivals         enable row level security;
alter table public.transport_options enable row level security;
alter table public.feedback          enable row level security;
alter table public.audit_log         enable row level security;

drop policy if exists "regions: anyone reads" on public.regions;
create policy "regions: anyone reads" on public.regions
  for select to anon, authenticated using (true);

drop policy if exists "regions: admins add" on public.regions;
create policy "regions: admins add" on public.regions
  for insert to authenticated with check (public.is_admin());

drop policy if exists "regions: admins edit" on public.regions;
create policy "regions: admins edit" on public.regions
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

do $$
declare
  t text;
begin
  foreach t in array array['destinations', 'events', 'festivals', 'transport_options'] loop
    execute format('drop policy if exists "content: read published, admins read all" on public.%I', t);
    execute format(
      'create policy "content: read published, admins read all" on public.%I
         for select to anon, authenticated using (status = ''published'' or public.is_admin())', t);
    execute format('drop policy if exists "content: admins add" on public.%I', t);
    execute format(
      'create policy "content: admins add" on public.%I
         for insert to authenticated with check (public.is_admin())', t);
    execute format('drop policy if exists "content: admins edit" on public.%I', t);
    execute format(
      'create policy "content: admins edit" on public.%I
         for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

drop policy if exists "feedback: send own" on public.feedback;
create policy "feedback: send own" on public.feedback
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and public.is_active()
    -- A new submission always starts unhandled
    and status = 'pending' and admin_note = '' and reviewed_by is null
  );

drop policy if exists "feedback: read own or as admin" on public.feedback;
create policy "feedback: read own or as admin" on public.feedback
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "feedback: admins moderate" on public.feedback;
create policy "feedback: admins moderate" on public.feedback
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "audit: admins read" on public.audit_log;
create policy "audit: admins read" on public.audit_log
  for select to authenticated using (public.is_admin());

revoke insert, update, delete on public.audit_log from anon, authenticated;
revoke delete on public.regions, public.destinations, public.events, public.festivals,
  public.transport_options, public.feedback from anon, authenticated;
grant select on public.regions, public.destinations, public.events, public.festivals,
  public.transport_options to anon;

-- ─── Managing accounts ───────────────────────────────────────────────────────
-- Role and status cannot be changed through the profiles table. These
-- functions are the only way, and each checks who is asking.

create or replace function public.admin_set_user_status(p_user_id uuid, p_status text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.profiles;
begin
  if not public.is_admin() then
    raise exception 'Only an administrator can do this.' using errcode = '42501';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'You cannot change your own account status.' using errcode = '42501';
  end if;
  if p_status not in ('active', 'suspended') then
    raise exception 'Unknown status: %', p_status using errcode = '22023';
  end if;

  update public.profiles set status = p_status where id = p_user_id returning * into v_row;
  if not found then
    raise exception 'Account not found.' using errcode = 'P0002';
  end if;

  perform public.write_audit(
    case when p_status = 'suspended' then 'suspended' else 'activated' end,
    'profiles', p_user_id::text, v_row.email
  );
  return v_row;
end;
$$;

create or replace function public.admin_set_user_role(p_user_id uuid, p_role text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.profiles;
  v_old text;
begin
  if not public.is_admin() then
    raise exception 'Only an administrator can do this.' using errcode = '42501';
  end if;
  -- Nobody changes their own role: an admin cannot remove the last check on themselves
  if p_user_id = auth.uid() then
    raise exception 'You cannot change your own role.' using errcode = '42501';
  end if;
  if p_role not in ('user', 'admin') then
    raise exception 'Unknown role: %', p_role using errcode = '22023';
  end if;

  select role into v_old from public.profiles where id = p_user_id;
  if not found then
    raise exception 'Account not found.' using errcode = 'P0002';
  end if;

  update public.profiles set role = p_role where id = p_user_id returning * into v_row;
  perform public.write_audit(
    'role_changed', 'profiles', p_user_id::text, v_row.email,
    jsonb_build_object('from', v_old, 'to', p_role)
  );
  return v_row;
end;
$$;

-- How many trips each of the given accounts has planned (admins cannot read the trips themselves).
create or replace function public.admin_user_trip_counts(p_user_ids uuid[])
returns table (user_id uuid, trips bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an administrator can do this.' using errcode = '42501';
  end if;
  return query
    select t.user_id, count(*) from public.trips t where t.user_id = any (p_user_ids) group by t.user_id;
end;
$$;

-- Records an administrator opening the admin area.
create or replace function public.log_admin_login()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    perform public.write_audit('admin_login', 'session', '', 'Opened the admin area');
  end if;
end;
$$;

-- ─── Destination views ───────────────────────────────────────────────────────
-- A daily count of how often each destination page is opened, for the admin
-- dashboard. Nothing about the visitor is stored. There are no policies, so the
-- table is reached only through the two functions that follow.

create table if not exists public.destination_views (
  destination_id text not null references public.destinations (id) on update cascade on delete cascade,
  viewed_on      date not null default current_date,
  views          integer not null default 0 check (views >= 0),
  primary key (destination_id, viewed_on)
);

alter table public.destination_views enable row level security;
revoke all on public.destination_views from anon, authenticated;

-- Called by the site when a destination page is opened. Accepts an id or a
-- slug; anything that is not a published destination is ignored.
create or replace function public.record_destination_view(p_destination text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.destination_views (destination_id, viewed_on, views)
  select d.id, current_date, 1
  from public.destinations d
  where (d.id = p_destination or d.slug = p_destination) and d.status = 'published'
  limit 1
  on conflict (destination_id, viewed_on) do update set views = public.destination_views.views + 1;
$$;

revoke all on function public.record_destination_view(text) from public;
grant execute on function public.record_destination_view(text) to anon, authenticated;

-- ─── Dashboard figures ───────────────────────────────────────────────────────
-- One round trip for every number on the admin dashboard.

create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an administrator can do this.' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'users', jsonb_build_object(
      'total', (select count(*) from public.profiles),
      'active', (select count(*) from public.profiles where status = 'active'),
      'suspended', (select count(*) from public.profiles where status = 'suspended'),
      'admins', (select count(*) from public.profiles where role = 'admin'),
      'newThisMonth', (select count(*) from public.profiles where created_at >= date_trunc('month', now()))
    ),
    'content', (
      select jsonb_object_agg(resource, counts) from (
        select 'destinations' as resource, jsonb_build_object(
          'total', count(*), 'published', count(*) filter (where status = 'published'),
          'draft', count(*) filter (where status = 'draft'), 'archived', count(*) filter (where status = 'archived')) as counts
        from public.destinations
        union all
        select 'events', jsonb_build_object(
          'total', count(*), 'published', count(*) filter (where status = 'published'),
          'draft', count(*) filter (where status = 'draft'), 'archived', count(*) filter (where status = 'archived'))
        from public.events
        union all
        select 'festivals', jsonb_build_object(
          'total', count(*), 'published', count(*) filter (where status = 'published'),
          'draft', count(*) filter (where status = 'draft'), 'archived', count(*) filter (where status = 'archived'))
        from public.festivals
        union all
        select 'transport_options', jsonb_build_object(
          'total', count(*), 'published', count(*) filter (where status = 'published'),
          'draft', count(*) filter (where status = 'draft'), 'archived', count(*) filter (where status = 'archived'))
        from public.transport_options
      ) c
    ),
    'regions', (select count(*) from public.regions),
    'upcomingEvents', (
      select count(*) from public.events where status = 'published' and end_date >= current_date
    ),
    'trips', (select count(*) from public.trips),
    'feedback', jsonb_build_object(
      'total', (select count(*) from public.feedback),
      'pending', (select count(*) from public.feedback where status = 'pending')
    ),
    'byRegion', coalesce((
      select jsonb_agg(row_to_json(r) order by r.name) from (
        select g.name,
          (select count(*) from public.destinations d where d.region_id = g.id and d.status <> 'archived') as destinations,
          (select count(*) from public.festivals f where f.region_id = g.id and f.status <> 'archived') as festivals,
          (select count(*) from public.events e where e.region_id = g.id and e.status <> 'archived') as events
        from public.regions g
      ) r
    ), '[]'::jsonb),
    'signupsByMonth', coalesce((
      select jsonb_agg(jsonb_build_object('month', to_char(m, 'YYYY-MM'), 'users', n) order by m) from (
        select date_trunc('month', gs)::date as m,
          (select count(*) from public.profiles p where date_trunc('month', p.created_at) = date_trunc('month', gs)) as n
        from generate_series(date_trunc('month', now()) - interval '5 months', date_trunc('month', now()), interval '1 month') gs
      ) s
    ), '[]'::jsonb),
    'mostViewed', coalesce((
      select jsonb_agg(jsonb_build_object('id', v.id, 'name', v.name, 'views', v.views) order by v.views desc, v.name) from (
        select d.id, d.name, sum(w.views)::int as views
        from public.destination_views w
        join public.destinations d on d.id = w.destination_id
        where w.viewed_on > current_date - 30
        group by d.id, d.name
        order by sum(w.views) desc, d.name
        limit 5
      ) v
    ), '[]'::jsonb),
    'viewsLast30Days', (
      select coalesce(sum(views), 0)::int from public.destination_views where viewed_on > current_date - 30
    )
  );
end;
$$;

revoke all on function public.admin_set_user_status(uuid, text) from public, anon;
revoke all on function public.admin_set_user_role(uuid, text) from public, anon;
revoke all on function public.admin_user_trip_counts(uuid[]) from public, anon;
revoke all on function public.admin_dashboard_stats() from public, anon;
revoke all on function public.log_admin_login() from public, anon;
grant execute on function public.admin_set_user_status(uuid, text) to authenticated;
grant execute on function public.admin_set_user_role(uuid, text) to authenticated;
grant execute on function public.admin_user_trip_counts(uuid[]) to authenticated;
grant execute on function public.admin_dashboard_stats() to authenticated;
grant execute on function public.log_admin_login() to authenticated;

-- ─── Media storage ───────────────────────────────────────────────────────────
-- A public bucket for tourism photos. Anyone can view; only admins upload,
-- replace or remove, and only images up to 5 MB.

do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('media', 'media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
    on conflict (id) do update
      set public = excluded.public,
          file_size_limit = excluded.file_size_limit,
          allowed_mime_types = excluded.allowed_mime_types;

    execute 'drop policy if exists "media: anyone views" on storage.objects';
    execute 'create policy "media: anyone views" on storage.objects for select to anon, authenticated using (bucket_id = ''media'')';
    execute 'drop policy if exists "media: admins upload" on storage.objects';
    execute 'create policy "media: admins upload" on storage.objects for insert to authenticated with check (bucket_id = ''media'' and public.is_admin())';
    execute 'drop policy if exists "media: admins replace" on storage.objects';
    execute 'create policy "media: admins replace" on storage.objects for update to authenticated using (bucket_id = ''media'' and public.is_admin()) with check (bucket_id = ''media'' and public.is_admin())';
    execute 'drop policy if exists "media: admins remove" on storage.objects';
    execute 'create policy "media: admins remove" on storage.objects for delete to authenticated using (bucket_id = ''media'' and public.is_admin())';
  end if;
end $$;
