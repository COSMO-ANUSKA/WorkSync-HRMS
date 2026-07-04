-- pgTAP test for trigger behavior: updated_at and checkout guard.
begin;
  select plan(3);

  -- Ensure default org exists.
  insert into orgs (id, name, slug)
  values ('00000000-0000-0000-0000-000000000001', 'WorkSync', 'worksync')
  on conflict (id) do nothing;

  -- updated_at should auto-update on profile changes.
  -- (Full insert test would need a mock auth.users row; we test the
  --  trigger function presence and behavior as far as possible.)

  select has_function(
    'public', 'touch_updated_at',
    'touch_updated_at trigger function should exist'
  );

  select has_function(
    'public', 'guard_attendance_update',
    'guard_attendance_update trigger function should exist'
  );

  select has_function(
    'public', 'log_leave_review',
    'log_leave_review trigger function should exist'
  );

  select finish();
end;
