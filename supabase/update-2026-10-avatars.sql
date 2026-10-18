-- YenkoGH profile photos update, October 2026. Run once in the Supabase SQL
-- editor, after update-2026-10-compliance.sql. Safe to run more than once.
--
-- 1. Lets travellers upload their own profile photo: an "avatars" storage
--    bucket where each person can only write inside their own folder.
-- 2. Only accepts a profile photo address that points into the owner's own
--    folder, so nobody can set an outside image (which could be used to log
--    the IP address of anyone viewing it, administrators included).
-- 3. Clears older photo addresses that do not meet that rule; those people
--    see their initials until they upload a photo.
-- 4. Sign-up no longer copies a photo address from the sign-up request.

update public.profiles set avatar = null
where avatar is not null and avatar !~ ('^https://[a-z0-9]+\.supabase\.co/storage/v1/object/public/avatars/' || id::text || '/[0-9]+-[0-9a-f]{8}\.(webp|jpg)$');

alter table public.profiles drop constraint if exists profiles_avatar_url;
alter table public.profiles add constraint profiles_avatar_url
  check (avatar is null or avatar ~ ('^https://[a-z0-9]+\.supabase\.co/storage/v1/object/public/avatars/' || id::text || '/[0-9]+-[0-9a-f]{8}\.(webp|jpg)$'));

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

-- ─── Profile photos ──────────────────────────────────────────────────────────
-- A public bucket so photos load anywhere on the site, but each person can
-- only add, replace, list or remove files in their own folder (named after
-- their user id). Small images only: the app crops and re-encodes photos to
-- about 320 px before upload. No SVG, which can carry script.

do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/webp'])
    on conflict (id) do update
      set public = excluded.public,
          file_size_limit = excluded.file_size_limit,
          allowed_mime_types = excluded.allowed_mime_types;

    execute 'drop policy if exists "avatars: owner lists" on storage.objects';
    execute 'create policy "avatars: owner lists" on storage.objects for select to authenticated using (bucket_id = ''avatars'' and (storage.foldername(name))[1] = auth.uid()::text)';
    execute 'drop policy if exists "avatars: owner uploads" on storage.objects';
    execute 'create policy "avatars: owner uploads" on storage.objects for insert to authenticated with check (bucket_id = ''avatars'' and (storage.foldername(name))[1] = auth.uid()::text and array_length(storage.foldername(name), 1) = 1 and public.is_active())';
    execute 'drop policy if exists "avatars: owner replaces" on storage.objects';
    execute 'create policy "avatars: owner replaces" on storage.objects for update to authenticated using (bucket_id = ''avatars'' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = ''avatars'' and (storage.foldername(name))[1] = auth.uid()::text and array_length(storage.foldername(name), 1) = 1 and public.is_active())';
    execute 'drop policy if exists "avatars: owner removes" on storage.objects';
    execute 'create policy "avatars: owner removes" on storage.objects for delete to authenticated using (bucket_id = ''avatars'' and (storage.foldername(name))[1] = auth.uid()::text)';
  end if;
end $$;
