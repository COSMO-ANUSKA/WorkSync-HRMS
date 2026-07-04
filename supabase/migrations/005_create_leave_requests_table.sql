create table if not exists leave_requests (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id),
  employee_id uuid not null references profiles(id) on delete cascade,
  leave_type leave_type not null,
  start_date date not null,
  end_date date not null,
  reason text not null,
  status leave_status not null default 'pending',
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  review_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_leave_date_range check (end_date >= start_date)
);

comment on table leave_requests is 'Employee leave requests and review state';
