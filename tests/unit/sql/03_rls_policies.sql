-- pgTAP test for RLS policy presence on every table.
begin;
  select plan(15);

  select has_policy('orgs', 'orgs_admin_read');
  select has_policy('profiles', 'profiles_self_read');
  select has_policy('profiles', 'profiles_self_edit');
  select has_policy('attendance', 'attendance_self_read');
  select has_policy('attendance', 'attendance_self_write');
  select has_policy('attendance', 'attendance_self_update_checkout');
  select has_policy('leave_requests', 'leave_self_access');
  select has_policy('leave_requests', 'leave_self_create');
  select has_policy('leave_requests', 'leave_admin_update');
  select has_policy('payroll', 'payroll_self_read');
  select has_policy('payroll', 'payroll_admin_write');
  select has_policy('payroll', 'payroll_admin_update');
  select has_policy('audit_log', 'audit_admin_read');
  select has_policy('notifications', 'notifications_self_read');
  select has_policy('notifications', 'notifications_admin_read_org');

  select finish();
end;
