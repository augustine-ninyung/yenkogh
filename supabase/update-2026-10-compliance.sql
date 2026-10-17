-- YenkoGH compliance update, October 2026. Run once in the Supabase SQL editor
-- on a database set up before this date. Safe to run more than once.
--
-- 1. Clears the placeholder star ratings and review counts that shipped with
--    the starting content. No reviews were ever collected, so showing them
--    would present invented reviews as real. The site hides ratings while
--    review_count is 0.
-- 2. Adds delete_own_account(), used by the "Delete account" button on the
--    profile page (same definition as in schema.sql).

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
