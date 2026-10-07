-- YenkoGH update, October 2026. Run once in the Supabase SQL editor AFTER
-- re-running setup.sql (which adds the new destinations, Metro Mass Transit and
-- the destination view counter without touching existing rows).
--
-- This adds Yango to the ride-hailing entry. It only changes the row if it
-- still has its original name, so an administrator's own edits are left alone.

update public.transport_options
set name = 'Uber, Bolt & Yango',
    description = replace(
      description,
      'including Kumasi, Takoradi, and Tamale. Ride-hailing apps',
      'including Kumasi, Takoradi, and Tamale, and Yango operates in Accra and Kumasi. Ride-hailing apps'),
    details = jsonb_set(details, '{providers}', '["Uber", "Bolt", "Yango"]'::jsonb)
where id = 'ride-hailing' and name = 'Uber & Bolt';
