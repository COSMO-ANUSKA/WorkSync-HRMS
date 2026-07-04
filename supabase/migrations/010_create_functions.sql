create or replace function is_admin()
returns boolean
language plpgsql
security definer
stable
as $$
begin
  return exists (
    select 1
    from profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
end;
$$;

create or replace function current_profile_role()
returns user_role
language plpgsql
security definer
stable
as $$
declare
  v_role user_role;
begin
  select p.role into v_role
  from profiles p
  where p.id = auth.uid();

  return v_role;
end;
$$;

create or replace function current_profile_org_id()
returns uuid
language plpgsql
security definer
stable
as $$
declare
  v_org_id uuid;
begin
  select p.org_id into v_org_id
  from profiles p
  where p.id = auth.uid();

  return v_org_id;
end;
$$;

create or replace function get_leave_balance(p_employee_id uuid, p_leave_type leave_type, p_year integer)
returns integer
language plpgsql
security definer
stable
as $$
begin
  if auth.uid() <> p_employee_id and not is_admin() then
    raise exception 'insufficient privilege';
  end if;

  return coalesce((
    select count(*)::integer
    from leave_requests lr
    where lr.employee_id = p_employee_id
      and lr.leave_type = p_leave_type
      and lr.status = 'approved'
      and extract(year from lr.start_date) = p_year
  ), 0);
end;
$$;

create or replace function get_dashboard_stats(p_org_id uuid)
returns jsonb
language plpgsql
security definer
stable
as $$
begin
  if not is_admin() then
    raise exception 'insufficient privilege';
  end if;

  return jsonb_build_object('org_id', p_org_id);
end;
$$;

create or replace function guard_profiles_update()
returns trigger
language plpgsql
as $$
begin
  if not is_admin() then
    if new.role is distinct from old.role
      or new.employee_code is distinct from old.employee_code
      or new.job_title is distinct from old.job_title
      or new.department is distinct from old.department then
      raise exception 'insufficient privilege';
    end if;
  end if;

  return new;
end;
$$;

create or replace function guard_attendance_update()
returns trigger
language plpgsql
as $$
begin
  if not is_admin() then
    if new.employee_id is distinct from old.employee_id
      or new.work_date is distinct from old.work_date
      or new.check_in is distinct from old.check_in
      or new.status is distinct from old.status then
      raise exception 'insufficient privilege';
    end if;

    if new.check_out is distinct from old.check_out then
      if old.employee_id <> auth.uid() or old.work_date <> current_date then
        raise exception 'insufficient privilege';
      end if;
    end if;
  end if;

  return new;
end;
$$;

create or replace function log_leave_review()
returns trigger
language plpgsql
security definer
as $$
begin
  if old.status is distinct from new.status then
    insert into audit_log (org_id, actor_id, table_name, record_id, action, old_data, new_data)
    values (
      new.org_id,
      auth.uid(),
      'leave_requests',
      new.id,
      'status_change',
      to_jsonb(old),
      to_jsonb(new)
    );

    insert into notifications (org_id, user_id, type, title, message)
    values (
      new.org_id,
      new.employee_id,
      'leave_status_change',
      'Leave request updated',
      'Your leave request status changed to ' || new.status::text
    );
  end if;

  return new;
end;
$$;
