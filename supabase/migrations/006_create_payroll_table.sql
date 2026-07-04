create table if not exists payroll (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id),
  employee_id uuid not null unique references profiles(id) on delete cascade,
  base_salary numeric(12,2) not null default 0,
  allowances numeric(12,2) not null default 0,
  deductions numeric(12,2) not null default 0,
  currency text not null default 'INR',
  effective_from date not null default current_date,
  payment_status payment_status not null default 'draft',
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

comment on table payroll is 'Current payroll snapshot for an employee';
