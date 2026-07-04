# HRMS — System Architecture Plan
**Backend:** Supabase (Postgres + Auth + Storage + Edge Functions + Realtime)
**Status:** v1.0 — derived from PRD (Draft v1.0, July 2026)

---

## 1. Architectural Approach & Key Decisions

Before the diagrams: a few decisions that shape everything downstream, and why.

| Decision | Choice | Reason |
|---|---|---|
| Authorization enforcement | **Database-level (RLS)**, not app-level | PRD 5.0 requires role-based access "enforced server-side." Client-side or API-middleware-only checks are a common but weak pattern — any new client, script, or future mobile app inherits the hole. RLS makes the database itself the single source of truth for who can touch what. |
| Business logic placement | **Postgres functions/triggers for invariants, Edge Functions for orchestration** | Don't put transactional integrity (e.g. "leave status change must write an audit row atomically") in the client or in an Edge Function — a partial failure there leaves inconsistent state. Anything that must be atomic goes in the DB as a function/trigger. Edge Functions handle things that need external calls, cross-cutting orchestration, or aren't expressible as pure SQL constraints. |
| Multi-tenancy | Single-tenant schema now, **tenant_id column reserved from day one** | PRD 7.0 explicitly scopes v1.0 to one org, but "no multi-company support in v1.0" is a roadmap statement, not a permanent one. Retrofitting a tenant column onto a live RLS policy set later is a rewrite, not a migration. Adding a nullable `org_id` now and defaulting it costs nothing today and avoids that rewrite. |
| Audit logging | **Append-only table + DB trigger**, not app-level logging | PRD 5.0 requires all approval/rejection/payroll edits logged with timestamp+actor. If logging happens in application code, any code path that forgets to call it silently breaks compliance. A trigger on the mutating tables can't be bypassed by a future engineer who doesn't know the rule exists. |
| Frontend/backend coupling | Thin client, **no business rules duplicated in frontend** | The frontend renders UI and calls Supabase directly (via RLS-protected queries) or Edge Functions for privileged operations. It never encodes "can this user approve this leave" — that's a policy question, not a UI question, and duplicating it invites drift. |

**Root-cause framing for the PRD's core ask:** the underlying problem (§1.2) is fragmented, unauditable, permission-less data — not "no UI for HR." A UI without server-enforced permissions and an immutable audit trail solves the surface complaint but reproduces the trust problem in a new coat of paint. The architecture below treats RLS + audit trail as the load-bearing wall, not an add-on.

---

## 2. High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Web, responsive)                 │
│   React/Next.js SPA — role-aware routing, no business logic     │
│   ┌───────────────┐  ┌───────────────┐  ┌──────────────────┐    │
│   │  Auth screens │  │  Employee UI  │  │   Admin/HR UI    │    │
│   └───────────────┘  └───────────────┘  └──────────────────┘    │
└───────────────┬─────────────────────────────┬───────────────────┘
                │ Supabase client SDK          │ Realtime subscriptions
                │ (Postgrest + RLS)             │ (leave status, dashboard)
                ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          SUPABASE PLATFORM                      │
│  ┌───────────────┐  ┌────────────────────┐  ┌────────────────┐  │
│  │  Supabase Auth │  │  PostgREST (auto   │  │  Edge Functions │  │
│  │  (JWT, email   │  │  REST API + RLS    │  │  (Deno) —       │  │
│  │  verification) │  │  enforced per-row) │  │  privileged ops │  │
│  └───────┬───────┘  └─────────┬──────────┘  └────────┬───────┘  │
│          │                    │                       │          │
│          ▼                    ▼                       ▼          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  Postgres (source of truth)                │  │
│  │  Tables + RLS policies + Functions + Triggers + Views       │  │
│  │  - profiles, attendance, leave_requests, payroll,           │  │
│  │    audit_log, roles                                         │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────┐                                               │
│  │Supabase Storage│  (profile pictures, documents)                │
│  └───────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
```

**Why Edge Functions exist at all, given RLS does most of the work:** a small set of operations are correct *only* if performed with elevated privilege and validated server-side outside the client's reach — e.g. finalizing a payroll change that must also trigger a notification, or an admin action that needs to touch two tables atomically with logic too complex for a single RLS check. Everything else goes straight through PostgREST with RLS. Don't build a parallel REST API in front of Supabase "just in case" — that reintroduces the fragmented-logic problem the PRD is trying to escape, and it's technical debt from day one.

---

## 3. Data Model

Design principles applied: normalize where data has independent lifecycle (profile vs. employment vs. salary), avoid nullable-heavy "god tables," and keep every row traceable to an actor and a timestamp.

```sql
-- Reserved for future multi-org support; defaults to a single org today.
-- All RLS policies key off org_id so multi-tenancy is a data change,
-- not a schema/policy rewrite, when it's needed.
create table orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create type user_role as enum ('employee', 'admin');

-- Mirrors auth.users 1:1; never store role/PII inside auth.users itself.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid not null references orgs(id) default '<default_org_id>',
  employee_code text unique not null,
  full_name text not null,
  role user_role not null default 'employee',
  phone text,
  address text,
  profile_picture_url text,
  job_title text,
  department text,
  date_joined date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table attendance (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id),
  employee_id uuid not null references profiles(id),
  work_date date not null,
  check_in timestamptz,
  check_out timestamptz,
  status text not null check (status in ('present','absent','half_day','leave')),
  created_at timestamptz not null default now(),
  unique (employee_id, work_date)          -- one record per employee per day
);

create type leave_type as enum ('paid', 'sick', 'unpaid');
create type leave_status as enum ('pending', 'approved', 'rejected');

create table leave_requests (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id),
  employee_id uuid not null references profiles(id),
  leave_type leave_type not null,
  start_date date not null,
  end_date date not null check (end_date >= start_date),
  remarks text,
  status leave_status not null default 'pending',
  reviewed_by uuid references profiles(id),
  reviewer_comment text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Kept fully separate from profiles: different access pattern (admin-write,
-- employee-read-only), different sensitivity class, different audit needs.
create table payroll (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id),
  employee_id uuid not null references profiles(id) unique,
  base_salary numeric(12,2) not null,
  allowances numeric(12,2) not null default 0,
  deductions numeric(12,2) not null default 0,
  currency text not null default 'INR',
  effective_from date not null default current_date,
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now()
);

-- Append-only. No update/delete policy exists for anyone, including admins.
create table audit_log (
  id bigint generated always as identity primary key,
  org_id uuid not null references orgs(id),
  actor_id uuid references profiles(id),
  action text not null,              -- e.g. 'leave.approved', 'payroll.updated'
  target_table text not null,
  target_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);
```

**Indexes to add immediately (not an afterthought):** `attendance(employee_id, work_date)`, `leave_requests(employee_id, status)`, `leave_requests(org_id, status)` for the admin pending-approvals view, `audit_log(org_id, created_at desc)`. These map directly to the PRD's dashboard queries (§4.2) and the 2-second load target (§5.0) — indexing after the fact means diagnosing slow dashboards in production instead of designing them out.

---

## 4. Authorization Model (Row-Level Security)

This is the architectural core. Every table above has RLS **enabled and default-deny**; policies are additive grants, never subtractive.

```sql
alter table profiles enable row level security;
alter table attendance enable row level security;
alter table leave_requests enable row level security;
alter table payroll enable row level security;
alter table audit_log enable row level security;

-- Helper: avoids repeating the admin-check subquery in every policy
create function is_admin() returns boolean as $$
  select role = 'admin' from profiles where id = auth.uid();
$$ language sql security definer stable;

-- profiles: self-read/edit-limited-fields, admin full access
create policy "self read" on profiles for select
  using (id = auth.uid() or is_admin());
create policy "self edit limited fields" on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());   -- column-level restriction enforced via a trigger, see §4.1
create policy "admin full write" on profiles for all
  using (is_admin());

-- attendance: employees see only their own; admins see all
create policy "own attendance" on attendance for select
  using (employee_id = auth.uid() or is_admin());
create policy "own checkin" on attendance for insert
  with check (employee_id = auth.uid());
create policy "admin manage attendance" on attendance for update using (is_admin());

-- leave_requests: employees create/read own; admins read/update all
create policy "own leave read" on leave_requests for select
  using (employee_id = auth.uid() or is_admin());
create policy "own leave create" on leave_requests for insert
  with check (employee_id = auth.uid());
create policy "admin review leave" on leave_requests for update
  using (is_admin());

-- payroll: employee read-only own row; only admin writes
create policy "own payroll read" on payroll for select
  using (employee_id = auth.uid() or is_admin());
create policy "admin payroll write" on payroll for insert with check (is_admin());
create policy "admin payroll update" on payroll for update using (is_admin());

-- audit_log: admin read-only, no client-side writes at all (trigger-only)
create policy "admin read audit" on audit_log for select using (is_admin());
```

### 4.1 Column-level write restriction (employees editing only address/phone/picture)

RLS is row-level, not column-level, so "employee can edit address/phone/picture but nothing else on their own profile" needs a `BEFORE UPDATE` trigger that rejects the write if any other column changed:

```sql
create function enforce_employee_editable_columns() returns trigger as $$
begin
  if is_admin() then
    return new;
  end if;
  if new.role is distinct from old.role
     or new.employee_code is distinct from old.employee_code
     or new.job_title is distinct from old.job_title
     or new.department is distinct from old.department then
    raise exception 'employees may not modify restricted fields';
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger profiles_column_guard
  before update on profiles
  for each row execute function enforce_employee_editable_columns();
```

This is the kind of rule that's easy to get "mostly right" with a UI that just hides the fields — and trivially bypassed by anyone calling the API directly. Enforcing it in the trigger means the UI hiding the fields is a UX nicety, not the actual security boundary.

### 4.2 Audit trigger (applies to leave approval and payroll edits)

```sql
create function log_leave_review() returns trigger as $$
begin
  if new.status is distinct from old.status then
    insert into audit_log (org_id, actor_id, action, target_table, target_id, metadata)
    values (new.org_id, auth.uid(), 'leave.' || new.status, 'leave_requests', new.id,
            jsonb_build_object('comment', new.reviewer_comment));
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger leave_audit after update on leave_requests
  for each row execute function log_leave_review();

-- Same pattern applied to payroll updates (action = 'payroll.updated').
```

---

## 5. Backend Logic Placement — What Goes Where

| Operation | Layer | Rationale |
|---|---|---|
| Read own profile/attendance/leave/payroll | PostgREST + RLS, direct from client | Pure row-scoped read, no orchestration needed |
| Check-in / check-out | PostgREST insert/update + RLS + unique constraint | Simple, and the unique `(employee_id, work_date)` constraint prevents double check-in without app code |
| Submit leave request | PostgREST insert + RLS | Straightforward, validated by CHECK constraints (date range) |
| Approve/reject leave | PostgREST update + RLS + trigger (audit) | Atomic in the DB; no Edge Function needed since it's single-table |
| Sign-up with email verification | Supabase Auth (built-in) | Don't reimplement — Supabase Auth already handles verification tokens, rate limiting, and password hashing correctly |
| Payroll update requiring cross-checks (e.g. notify employee, recompute derived totals) | **Edge Function** | Needs orchestration beyond a single-table write; keep it out of the client so the validation can't be skipped by calling the table directly |
| Admin bulk actions / reports | Edge Function or Postgres `view`/materialized view | Depends on whether it's a static aggregation (view) or needs external side effects (function) |

**A note on where NOT to put logic:** resist the urge to write a custom Express/Fastify API layer "for control." That reintroduces exactly the fragmentation the PRD's problem statement (§1.2) describes, just one layer down — two systems (Supabase's generated API and a hand-rolled one) that can drift out of sync on permissions. Supabase's generated API plus Edge Functions for the genuine exceptions is the leaner, more auditable choice here.

---

## 6. Frontend Architecture

```
src/
├── app/                      # Next.js App Router — route = permission boundary
│   ├── (auth)/                # sign-in, sign-up, verify-email
│   ├── (employee)/             # employee-only routes
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── attendance/
│   │   └── leave/
│   └── (admin)/                # admin-only routes
│       ├── dashboard/
│       ├── employees/
│       ├── leave-approvals/
│       └── payroll/
├── lib/
│   ├── supabase/               # typed client, generated types from DB schema
│   ├── queries/                 # one file per domain: attendance.ts, leave.ts...
│   └── auth/                   # session context, role guard hooks
├── components/
│   ├── ui/                     # pure, reusable, no data-fetching
│   └── domain/                 # feature components composed from ui/ + queries/
└── types/                      # generated from `supabase gen types typescript`
```

**Rules enforced by this structure, not just convention:**
- **UI components never call Supabase directly.** They receive data via props or hooks from `lib/queries/`. This is the same "don't mix UI with engine logic" principle applied here: rendering and data-access are separate concerns, and mixing them is what makes a codebase brittle when the schema evolves.
- **Route grouping mirrors the permission boundary**, not just page layout — `(admin)` and `(employee)` segments make it visually obvious in the codebase which surface a given screen belongs to, and a middleware-level route guard (checking the session role) sits at the group boundary as defense-in-depth *on top of* RLS — never as a substitute for it.
- **Types are generated, not hand-written.** `supabase gen types typescript` from the live schema. Hand-maintained types drift from the schema silently; generated types fail loudly (a build error) the moment schema and frontend disagree.

---

## 7. Realtime & Dashboard Performance

PRD §5.0 requires dashboard/attendance loads under 2 seconds and PRD §4.2 wants live status (leave approved, attendance flagged) reflected without a manual refresh.

- **Supabase Realtime** subscriptions on `leave_requests` (status changes) and `attendance` scoped by RLS — a client only receives realtime events for rows it's already allowed to select, so this doesn't need separate authorization logic.
- **Admin dashboard aggregates** (pending leave count, attendance summary) should be backed by a Postgres `view` or `materialized view` refreshed on a schedule if the org grows large, rather than the client fetching full row sets and aggregating client-side. Pushing aggregation into the DB is the difference between a query that scales with employee count and one that doesn't.
- **Avoid N+1 patterns** in the employee list + attendance view (PRD §4.2.2 "switch between employee records") — use a single joined query or a Postgres function returning a composed result, not a per-row fetch loop from the client.

---

## 8. Scalability Path (PRD §5.0: "small teams to enterprise-scale")

| Concern | v1.0 posture | Scale-out path when needed |
|---|---|---|
| Tenancy | Single org, `org_id` reserved | Flip RLS policies to filter by `org_id = current_org()`; no schema rewrite |
| Read load | Direct Postgres via PostgREST | Supabase read replicas; move heavy aggregation to materialized views |
| Attendance/leave volume | Standard indexes | Partition `attendance` by month if row counts justify it — not before, since premature partitioning adds operational complexity for no measured benefit |
| Storage (profile pics, docs) | Supabase Storage, per-org bucket policy | Same mechanism scales; add CDN caching for public-ish assets if needed |
| Function load | Edge Functions (auto-scaled by platform) | No architectural change needed; Supabase manages this |

The theme here: v1.0 should be built *correctly*, not *maximally scaled*. Sharding, partitioning, and multi-region setups now — before there's a measured bottleneck — is exactly the "overengineering" this plan is trying to avoid. The `org_id` reservation and RLS-first design are the only pieces of speculative future-proofing that earn their cost today, because retrofitting them later is a full rewrite rather than a config change.

---

## 9. Security & Compliance Checklist (mapped to PRD §5.0)

- [x] Passwords: handled by Supabase Auth (bcrypt), never touched by app code.
- [x] Email verification required before first sign-in — Supabase Auth setting, enforced server-side.
- [x] Role-based access enforced at the database layer (RLS), not just hidden in UI.
- [x] Salary/personal data visible only to the employee and admins — enforced by `payroll`/`profiles` RLS policies above, not by route guards alone.
- [x] All approval/rejection/payroll mutations logged with actor + timestamp via `audit_log` trigger — cannot be bypassed by forgetting to call a logging function.
- [x] `audit_log` has no update/delete policy for any role — append-only by construction, not by convention.
- [ ] **Recommend adding for production:** rate limiting on sign-in (Supabase Auth supports this natively — enable it, don't build it), and a periodic RLS policy review as new tables get added (a missing `enable row level security` on a new table is silently permissive by default in Postgres if RLS is off, so this should be a checklist item in code review, not just at initial build).

---

## 10. Deployment & Environments

- **Environments:** separate Supabase projects for `dev`, `staging`, `prod` — never share a database across environments; migrations get tested in staging before prod.
- **Schema migrations:** managed via Supabase CLI (`supabase migration new`, `supabase db push`), version-controlled in the repo, not applied by hand through the dashboard. Hand-applied schema changes are untracked technical debt from the moment they're made.
- **CI:** run migrations against a fresh staging DB + type generation (`supabase gen types`) on every PR touching `supabase/migrations/`, so a schema/type mismatch is a CI failure, not a runtime bug.
- **Frontend hosting:** Vercel/Netlify (Next.js), environment variables scoped per environment, service-role key **never** exposed to the client bundle — only the anon key, which is safe specifically because RLS is enforced.

---

## 11. What This Plan Deliberately Avoids

- No custom API server layered in front of Supabase "for flexibility" — it's unnecessary surface area and a second place permissions can drift.
- No client-side-only permission checks — every one of them has a matching RLS policy; the client checks exist purely for UX (hiding buttons the user couldn't use anyway), never as the actual boundary.
- No premature partitioning/sharding — the schema is designed to *allow* it later without a rewrite, but it isn't built now against unmeasured load.
- No JSON blob "flexible schema" columns for core entities (profile, attendance, leave, payroll) — the PRD's data is well-structured and stable; a normalized schema with real constraints catches bugs at write-time that a JSONB blob would let through silently.

---

## 12. Open Questions for Stakeholders (before build starts)

1. PRD §7.0 assumes "reasonably trusted client devices" for check-in with no biometric/geofencing in v1.0 — confirm this is acceptable for the audit/compliance story, since it means check-in time is client-reported, not independently verified.
2. Currency/locale: payroll schema above defaults to INR — confirm if multi-currency matters even for v1.0's single-org scope.
3. Document storage (PRD §4.3.1 "documents" under profile) — confirm document types and retention requirements before finalizing the Storage bucket policy.
