-- YenkoGH site traffic update, October 2026. Run once in the Supabase SQL
-- editor. Safe to run more than once.
--
-- Adds anonymous daily page-view totals for the admin Traffic page. No IP
-- address, account, cookie or identifier is stored.

-- ─── Site traffic ────────────────────────────────────────────────────────────
-- Anonymous daily totals for the admin Traffic page: which kind of page was
-- opened, the site a visit came from (on its first page only), and the screen
-- size class. No IP address, account, cookie or identifier is stored, so
-- nothing here can be linked to a person. The site skips counting for
-- browsers that send Do Not Track or Global Privacy Control.
--
-- referrer is 'internal' for moves within the site, 'direct' for a visit with
-- no referring site, 'other' once a day has too many distinct sources, or the
-- referring site's domain.

create table if not exists public.page_views (
  viewed_on date    not null default current_date,
  path      text    not null check (char_length(path) <= 40),
  referrer  text    not null check (char_length(referrer) <= 60),
  device    text    not null check (device in ('mobile', 'tablet', 'desktop')),
  views     integer not null default 0 check (views >= 0),
  primary key (viewed_on, path, referrer, device)
);

alter table public.page_views enable row level security;
revoke all on public.page_views from anon, authenticated;

-- Called by the site on each page change. Anything outside the known page
-- list, or malformed, is ignored.
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
    '/transportation', '/planner', '/budget', '/login', '/register',
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

revoke all on function public.record_page_view(text, text, text) from public;
grant execute on function public.record_page_view(text, text, text) to anon, authenticated;

-- For the admin Traffic page: totals over the last p_days days.
create or replace function public.admin_traffic_stats(p_days integer)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  span integer := least(greatest(coalesce(p_days, 30), 1), 400);
  since date := current_date - (span - 1);
begin
  if not public.is_admin() then
    raise exception 'admins only';
  end if;
  return json_build_object(
    'days', (
      select coalesce(json_agg(json_build_object('day', d::date, 'views', coalesce(v.views, 0), 'visits', coalesce(v.visits, 0)) order by d), '[]'::json)
      from generate_series(since, current_date, interval '1 day') d
      left join (
        select viewed_on, sum(views) as views, sum(views) filter (where referrer <> 'internal') as visits
        from public.page_views where viewed_on >= since group by viewed_on
      ) v on v.viewed_on = d::date
    ),
    'pages', (
      select coalesce(json_agg(json_build_object('path', path, 'views', views) order by views desc, path), '[]'::json)
      from (select path, sum(views) as views from public.page_views where viewed_on >= since group by path) p
    ),
    'referrers', (
      select coalesce(json_agg(json_build_object('source', referrer, 'visits', visits) order by visits desc, referrer), '[]'::json)
      from (
        select referrer, sum(views) as visits from public.page_views
        where viewed_on >= since and referrer <> 'internal' group by referrer order by visits desc limit 15
      ) r
    ),
    'devices', (
      select coalesce(json_agg(json_build_object('device', device, 'views', views) order by views desc), '[]'::json)
      from (select device, sum(views) as views from public.page_views where viewed_on >= since group by device) x
    )
  );
end;
$$;

revoke all on function public.admin_traffic_stats(integer) from public, anon;
grant execute on function public.admin_traffic_stats(integer) to authenticated;
