create index if not exists idx_attendance_employee_work_date on attendance(employee_id, work_date);
create index if not exists idx_leave_requests_employee_status on leave_requests(employee_id, status);
create index if not exists idx_leave_requests_org_status on leave_requests(org_id, status);
create index if not exists idx_audit_log_org_created_at on audit_log(org_id, created_at desc);
create index if not exists idx_payroll_employee_id on payroll(employee_id);
create index if not exists idx_notifications_user_read_at on notifications(user_id, read_at);
create index if not exists idx_notifications_org_created_at on notifications(org_id, created_at desc);
