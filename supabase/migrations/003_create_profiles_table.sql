create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid not null references orgs(id),
  employee_code text not null unique,
  full_name text not null,
  role user_role not null default 'employee',
  department text,
  job_title text,
  phone text,
  address text,
  picture_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table profiles is 'Employee profile linked 1:1 to auth.users';
comment on column profiles.org_id is 'Organization membership';
comment on column profiles.employee_code is 'Human-readable employee identifier';
comment on column profiles.role is 'Application role used for authorization';
