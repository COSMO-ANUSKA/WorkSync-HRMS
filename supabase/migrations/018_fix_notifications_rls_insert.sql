-- Bug fix: the notifications table had RLS enabled (migration 011) but no
-- INSERT policy, meaning direct client-side inserts were silently blocked
-- by Postgres even for valid admins.
--
-- Policy rules:
--   • Only admins may insert notifications, and only for their own org.
--   • The service-role key used by edge functions bypasses RLS entirely,
--     so existing edge-function notification writes are unaffected.

create policy "notifications_admin_insert"
  on notifications
  for insert
  with check (
    is_admin()
    and org_id = current_profile_org_id()
  );
