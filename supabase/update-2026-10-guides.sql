-- YenkoGH tour guides update, October 2026. Run once in the Supabase SQL editor,
-- after update-2026-10-traffic.sql. Safe to run more than once.
--
-- Adds the tour guide directory, and lets the Traffic page count its page.

-- ─── Tour guides ─────────────────────────────────────────────────────────────
-- Licensed guides, added and verified by administrators. The check constraint
-- is the rule that matters: a guide cannot be public until their licence is
-- recorded and verified and they have agreed to be listed, however the row is
-- written. Rows are archived rather than deleted, like other content.

create table if not exists public.tour_guides (
  id                text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  position          integer not null default 1000,
  name              text not null check (char_length(name) between 2 and 120),
  region_id         text not null references public.regions (id) on update cascade,
  description       text not null default '' check (char_length(description) <= 1000),
  image_url         text not null default '' check (image_url = '' or image_url ~ '^https://'),
  licence_number    text not null default '' check (char_length(licence_number) <= 60),
  verified          boolean not null default false,
  verified_on       date,
  consent_confirmed boolean not null default false,
  status            text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  details           jsonb not null default '{}'::jsonb check (pg_column_size(details) <= 8192),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  archived_at       timestamptz,
  constraint tour_guides_publish_check check (
    status <> 'published'
    or (verified and verified_on is not null and btrim(licence_number) <> '' and consent_confirmed)
  )
);

create index if not exists tour_guides_region_idx on public.tour_guides (region_id);
create index if not exists tour_guides_status_idx on public.tour_guides (status);

alter table public.tour_guides enable row level security;

drop policy if exists "guides: read published, admins read all" on public.tour_guides;
create policy "guides: read published, admins read all" on public.tour_guides
  for select to anon, authenticated using (status = 'published' or public.is_admin());
drop policy if exists "guides: admins add" on public.tour_guides;
create policy "guides: admins add" on public.tour_guides
  for insert to authenticated with check (public.is_admin());
drop policy if exists "guides: admins edit" on public.tour_guides;
create policy "guides: admins edit" on public.tour_guides
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

revoke delete on public.tour_guides from anon, authenticated;
grant select on public.tour_guides to anon, authenticated;
grant insert, update on public.tour_guides to authenticated;

drop trigger if exists set_updated_at on public.tour_guides;
create trigger set_updated_at before update on public.tour_guides
  for each row execute function public.set_updated_at();
drop trigger if exists audit_content on public.tour_guides;
create trigger audit_content after insert or update on public.tour_guides
  for each row execute function public.audit_content();
drop trigger if exists stamp_archived_at on public.tour_guides;
create trigger stamp_archived_at before insert or update on public.tour_guides
  for each row execute function public.stamp_archived_at();

-- The Traffic page's list of known pages now includes /guides.
create or replace function public.record_page_view(p_path text, p_referrer text, p_device text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ref text := lower(coalesce(p_referrer, ''));
begin
  if p_path is null or not (p_path = any (array[
    '/', '/explore', '/explore/:id', '/events', '/events/:id', '/festivals/:id',
    '/transportation', '/guides', '/planner', '/budget', '/login', '/register',
    '/forgot-password', '/reset-password', '/privacy', '/terms', '/cookies',
    '/credits', '/dashboard', '/dashboard/trips', '/dashboard/saved',
    '/dashboard/budget', '/dashboard/profile', '/dashboard/settings', '/profile',
    '(not found)'
  ])) then
    return;
  end if;
  if p_device is null or p_device not in ('mobile', 'tablet', 'desktop') then
    return;
  end if;
  if ref not in ('internal', 'direct') and ref !~ '^[a-z0-9-]+(\.[a-z0-9-]+)+$' then
    return;
  end if;
  if char_length(ref) > 60 then
    ref := 'other';
  end if;
  -- Keep the table small even if someone sends made-up sources
  if ref not in ('internal', 'direct')
     and (select count(distinct referrer) from public.page_views where viewed_on = current_date) >= 200
     and not exists (select 1 from public.page_views where viewed_on = current_date and referrer = ref) then
    ref := 'other';
  end if;

  insert into public.page_views (viewed_on, path, referrer, device, views)
  values (current_date, p_path, ref, p_device, 1)
  on conflict (viewed_on, path, referrer, device) do update set views = public.page_views.views + 1;

  -- Totals older than about 13 months are not needed
  if random() < 0.01 then
    delete from public.page_views where viewed_on < current_date - 400;
  end if;
end;
$$;
