create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
before update on profiles
for each row execute function touch_updated_at();

create trigger trg_leave_requests_updated_at
before update on leave_requests
for each row execute function touch_updated_at();

create trigger trg_profiles_column_guard
before update on profiles
for each row execute function guard_profiles_update();

create trigger trg_attendance_checkout_guard
before update on attendance
for each row execute function guard_attendance_update();

create trigger trg_leave_audit
after update on leave_requests
for each row execute function log_leave_review();
