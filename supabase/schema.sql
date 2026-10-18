-- YenkoGH database schema (Supabase / Postgres)
--
-- Run this once in the Supabase dashboard: SQL Editor > New query > paste > Run.
-- It is safe to run again; every statement is written to be repeatable.
--
-- Holds user data only: profiles, trips and budgets. Destinations, events and
-- festivals still ship with the app as files.

-- ─── Profiles ────────────────────────────────────────────────────────────────
-- One row per account, created automatically when someone signs up.

create table if not exists public.profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  name               text not null default '',
  email              text not null default '',
  role               text not null default 'user' check (role in ('user', 'admin')),
  avatar             text,
  bio                text,
  preferences        jsonb not null default '{"currency": "GHS", "language": "en", "notifications": true}'::jsonb,
  saved_destinations text[] not null default '{}',
  saved_events       text[] not null default '{}',
  created_at         timestamptz not null default now()
);

-- ─── Trips ───────────────────────────────────────────────────────────────────

create table if not exists public.trips (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name                text not null,
  destinations        text[] not null default '{}',
  start_date          date not null,
  end_date            date not null,
  number_of_travelers integer not null default 1 check (number_of_travelers > 0),
  status              text not null default 'planning'
                        check (status in ('planning', 'upcoming', 'ongoing', 'completed')),
  itinerary           jsonb,
  festival_id         text,
  accommodations      jsonb not null default '[]'::jsonb,
  budget_id           uuid,
  notes               text,
  created_at          timestamptz not null default now(),
  check (end_date >= start_date)
);

create index if not exists trips_user_id_idx on public.trips (user_id);

-- ─── Budgets ─────────────────────────────────────────────────────────────────
-- A budget may stand alone or belong to one trip. Deleting the trip deletes it.

create table if not exists public.budgets (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  trip_id      uuid references public.trips (id) on delete cascade,
  name         text not null,
  total_budget numeric(12, 2) not null default 0 check (total_budget >= 0),
  currency     text not null default 'GHS',
  categories   jsonb not null default '[]'::jsonb,
  items        jsonb not null default '[]'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists budgets_user_id_idx on public.budgets (user_id);
-- At most one budget per trip
create unique index if not exists budgets_trip_id_key on public.budgets (trip_id) where trip_id is not null;

-- ─── New accounts get a profile ──────────────────────────────────────────────

-- ─── Size limits on what travellers can write ────────────────────────────────
-- Stops oversized values (megabyte names, huge itineraries) being stored
-- through the API. Added NOT VALID so rows saved before the limits existed do
-- not block this script; every new insert and update is checked.

do $$
declare
  c record;
begin
  for c in select * from (values
    ('profiles', 'profiles_name_length',     'char_length(name) <= 80'),
    ('profiles', 'profiles_bio_length',      'bio is null or char_length(bio) <= 500'),
    ('profiles', 'profiles_avatar_url',      'avatar is null or avatar ~ (''^https://[a-z0-9]+\.supabase\.co/storage/v1/object/public/avatars/'' || id::text || ''/[0-9]+-[0-9a-f]{8}\.(webp|jpg)$'')'),
    ('profiles', 'profiles_saved_count',     'cardinality(saved_destinations) <= 500 and cardinality(saved_events) <= 500'),
    ('profiles', 'profiles_preferences_size','pg_column_size(preferences) <= 2048'),
    ('trips',    'trips_name_length',        'char_length(name) between 1 and 120'),
    ('trips',    'trips_notes_length',       'notes is null or char_length(notes) <= 2000'),
    ('trips',    'trips_destinations_count', 'cardinality(destinations) <= 50'),
    ('trips',    'trips_travelers_max',      'number_of_travelers <= 100'),
    ('trips',    'trips_itinerary_size',     'itinerary is null or pg_column_size(itinerary) <= 262144'),
    ('trips',    'trips_accommodations_size','pg_column_size(accommodations) <= 65536'),
    ('budgets',  'budgets_name_length',      'char_length(name) between 1 and 120'),
    ('budgets',  'budgets_currency_code',    'currency ~ ''^[A-Z]{3}$'''),
    ('budgets',  'budgets_total_max',        'total_budget <= 100000000'),
    ('budgets',  'budgets_json_size',        'pg_column_size(categories) <= 65536 and pg_column_size(items) <= 262144')
  ) as t(tbl, name, expr)
  loop
    if not exists (select 1 from pg_constraint where conname = c.name) then
      execute format('alter table public.%I add constraint %I check (%s) not valid', c.tbl, c.name, c.expr);
    end if;
  end loop;
end $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- The profile photo starts empty: it is only ever set by uploading one
  insert into public.profiles (id, name, email)
  values (
    new.id,
    left(coalesce(nullif(btrim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1)), 80),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Who is an admin ─────────────────────────────────────────────────────────
-- Runs with the table owner's rights so the profiles policies can call it
-- without recursing into themselves.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ─── Row-level security ──────────────────────────────────────────────────────
-- Everyone signed in can reach these tables through the API, so the policies
-- below are what keep each person to their own rows.

alter table public.profiles enable row level security;
alter table public.trips    enable row level security;
alter table public.budgets  enable row level security;

drop policy if exists "profiles: read own or as admin" on public.profiles;
create policy "profiles: read own or as admin" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles: create own" on public.profiles;
create policy "profiles: create own" on public.profiles
  for insert to authenticated
  with check (id = auth.uid() and role = 'user');

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- A person may edit their own profile but must not be able to make themselves
-- an admin, so `role` (and `id`, `email`, `created_at`) are not updatable
-- through the API. Roles are changed only from the SQL editor.
revoke update on public.profiles from authenticated;
grant update (name, avatar, bio, preferences, saved_destinations, saved_events)
  on public.profiles to authenticated;

drop policy if exists "trips: owner only" on public.trips;
create policy "trips: owner only" on public.trips
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "budgets: owner only" on public.budgets;
create policy "budgets: owner only" on public.budgets
  for all to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    -- A budget may only be attached to a trip its owner also owns; otherwise
    -- someone could claim the single budget slot on another person's trip.
    and (
      trip_id is null
      or exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
    )
  );

-- ─── Deleting your own account ───────────────────────────────────────────────
-- Called from the profile page. Removes the caller from auth.users; the
-- foreign keys above cascade to their profile, trips, budgets, feedback and
-- planner runs. Only ever acts on the signed-in user (auth.uid()).

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$;

revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;

-- ─── Making someone an admin ─────────────────────────────────────────────────
-- After that person has signed up, run this with their email:
--
--   update public.profiles set role = 'admin' where email = 'you@example.com';
