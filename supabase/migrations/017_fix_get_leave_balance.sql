-- Bug fix: get_leave_balance was returning days USED, not days REMAINING.
--
-- Strategy:
--   1. Rename the existing counting logic to get_leave_used() so callers
--      that need the raw "days taken" figure have an honest function name.
--   2. Introduce a get_leave_balance() that returns (allocation - used),
--      using a hard-coded per-type annual allocation table.
--      When a dedicated leave_allocations table is added in the future,
--      replace the CASE expression with a look-up against that table.

-- Step 1: drop the old misleadingly-named function
drop function if exists get_leave_balance(uuid, leave_type, integer);

-- Step 2: create get_leave_used() — counts approved leaves taken
create or replace function get_leave_used(
  p_employee_id uuid,
  p_leave_type  leave_type,
  p_year        integer
)
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
      and lr.leave_type  = p_leave_type
      and lr.status      = 'approved'
      and extract(year from lr.start_date) = p_year
  ), 0);
end;
$$;

-- Step 3: create get_leave_balance() — returns (allocation - days used)
--   Default annual allocations per leave type (adjust as needed):
--     paid    → 20 days
--     sick    → 10 days
--     unpaid  → unlimited (returns NULL so the UI can show "∞")
--     casual  →  8 days
--     maternity → 90 days
--     paternity → 15 days
create or replace function get_leave_balance(
  p_employee_id uuid,
  p_leave_type  leave_type,
  p_year        integer
)
returns integer
language plpgsql
security definer
stable
as $$
declare
  v_allocation integer;
  v_used       integer;
begin
  if auth.uid() <> p_employee_id and not is_admin() then
    raise exception 'insufficient privilege';
  end if;

  -- Annual allocation per leave type
  v_allocation := case p_leave_type
    when 'paid'       then 20
    when 'sick'       then 10
    when 'casual'     then  8
    when 'maternity'  then 90
    when 'paternity'  then 15
    when 'unpaid'     then null   -- unlimited; caller should handle NULL
    else                   null
  end;

  -- Unlimited leave type — no balance to track
  if v_allocation is null then
    return null;
  end if;

  v_used := get_leave_used(p_employee_id, p_leave_type, p_year);

  return greatest(v_allocation - v_used, 0);
end;
$$;
