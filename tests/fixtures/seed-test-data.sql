-- Reusable test data for integration tests.
-- Insert order: org -> auth.users (mock) -> profiles -> leave_requests -> attendance.

insert into orgs (id, name, slug)
values ('00000000-0000-0000-0000-000000000001', 'WorkSync', 'worksync')
on conflict (id) do nothing;

-- NOTE: auth.users rows must be created per environment.
-- The integration test harness handles signup via the Supabase Auth API
-- and then inserts the profile row tied to the returned user id.
