create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id),
  employee_id uuid not null references profiles(id) on delete cascade,
  work_date date not null,
  check_in timestamptz,
  check_out timestamptz,
  status attendance_status not null default 'absent',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attendance_employee_work_date_key unique (employee_id, work_date)
);

comment on table attendance is 'Daily employee attendance records';
