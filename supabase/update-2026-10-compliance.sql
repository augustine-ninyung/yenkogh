-- YenkoGH compliance update, October 2026. Run once in the Supabase SQL editor
-- on a database set up before this date. Safe to run more than once.
--
-- 1. Clears the placeholder star ratings and review counts that shipped with
--    the starting content. No reviews were ever collected, so showing them
--    would present invented reviews as real. The site hides ratings while
--    review_count is 0.
-- 2. Adds delete_own_account(), used by the "Delete account" button on the
--    profile page (same definition as in schema.sql).
-- 3. Adds size limits on what travellers can write (profiles, trips, budgets).
-- 4. Adds planner_quota(), which the trip planner uses for per-account rate
--    limits and the site-wide daily cap on AI use.
--
-- Every statement is safe to run again, so re-run the whole file even if an
-- earlier version of it has already been applied.

update public.destinations
set rating = 0, review_count = 0
where rating <> 0 or review_count <> 0;

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;

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
    ('profiles', 'profiles_avatar_url',      'avatar is null or (char_length(avatar) <= 500 and avatar ~* ''^https://'')'),
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

-- ─── Planner quota ───────────────────────────────────────────────────────────
-- Read by the planner before each run, for per-account rate limits and a
-- site-wide daily cap on AI use (the spending cap). Travellers can add rows of
-- their own, so in the site-wide figure each account counts for at most
-- p_per_user_cap runs: one account cannot use up everyone's allowance.

create index if not exists planner_runs_user_created_idx on public.planner_runs (user_id, created_at desc);

create or replace function public.planner_quota(p_per_user_cap integer)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'mine_hour', (select count(*) from public.planner_runs
                  where user_id = auth.uid() and created_at > now() - interval '1 hour'),
    'mine_day',  (select count(*) from public.planner_runs
                  where user_id = auth.uid() and created_at > now() - interval '1 day'),
    'ai_day',    (select coalesce(sum(least(n, greatest(p_per_user_cap, 1))), 0) from (
                    select count(*) as n from public.planner_runs
                    where source = 'ai' and created_at > now() - interval '1 day'
                    group by user_id
                  ) per_user)
  );
$$;

revoke all on function public.planner_quota(integer) from public, anon;
grant execute on function public.planner_quota(integer) to authenticated;
