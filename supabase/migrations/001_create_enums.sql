do $$ begin
  create type user_role as enum ('employee', 'manager', 'hr', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type leave_type as enum ('casual', 'sick', 'earned', 'unpaid');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type leave_status as enum ('pending', 'approved', 'rejected', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type attendance_status as enum ('present', 'absent', 'half_day', 'leave');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type payment_status as enum ('draft', 'pending', 'processed', 'failed');
exception when duplicate_object then null;
end $$;

comment on type user_role is 'Application role for each employee profile';
comment on type leave_type is 'Leave category used by leave requests';
comment on type leave_status is 'Lifecycle state for leave requests';
comment on type attendance_status is 'Daily attendance state';
comment on type payment_status is 'Processing state for payroll rows';
