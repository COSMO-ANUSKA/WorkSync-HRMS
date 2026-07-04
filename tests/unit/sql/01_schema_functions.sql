-- pgTAP test suite for SQL functions, triggers, and RLS policies.
-- Run with: supabase test db

begin;
  select plan(14);

  -- Helper: create a test user + profile in a single org.
  insert into orgs (id, name, slug)
  values ('00000000-0000-0000-0000-000000000099', 'Test Org', 'test-org')
  on conflict (id) do nothing;

  -- --- Function: is_admin ---
  select has_function(
    'public', 'is_admin',
    'is_admin() function should exist'
  );

  select has_function(
    'public', 'get_leave_balance',
    array['uuid', 'leave_type', 'integer'],
    'get_leave_balance(employee_id, leave_type, year) function should exist'
  );

  select has_function(
    'public', 'get_dashboard_stats',
    array['uuid'],
    'get_dashboard_stats(org_id) function should exist'
  );

  select has_function(
    'public', 'current_profile_org_id',
    'current_profile_org_id() function should exist'
  );

  -- --- Trigger: touch_updated_at ---
  select has_trigger('profiles', 'trg_profiles_updated_at');
  select has_trigger('leave_requests', 'trg_leave_requests_updated_at');

  -- --- Trigger guards ---
  select has_trigger('profiles', 'trg_profiles_column_guard');
  select has_trigger('attendance', 'trg_attendance_checkout_guard');
  select has_trigger('leave_requests', 'trg_leave_audit');

  -- --- RLS enabled on all tables ---
  select has_table('orgs');
  select is(
    (select relrowsecurity from pg_class where relname = 'orgs'),
    true,
    'RLS enabled on orgs'
  );

  select is(
    (select relrowsecurity from pg_class where relname = 'profiles'),
    true,
    'RLS enabled on profiles'
  );

  select is(
    (select relrowsecurity from pg_class where relname = 'notifications'),
    true,
    'RLS enabled on notifications'
  );

  select finish();
end;
