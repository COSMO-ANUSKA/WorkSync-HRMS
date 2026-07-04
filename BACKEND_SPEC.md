# Spec: WorkSync-HRMS Backend (Supabase)

## Objective

Build the complete backend for WorkSync-HRMS on Supabase (Postgres + Auth + Storage + Edge Functions + Realtime) as defined in `HRMS_Architecture_Plan.md`. The backend must enforce all authorization at the database layer via RLS, provide immutable audit logging via triggers, and expose a thin API surface through PostgREST + Edge Functions.

**User:** HR teams and employees at small-to-mid organizations
**Success:** All PRD §4-5 features work with server-enforced permissions, <2s dashboard loads, zero client-side permission logic

---

## Tech Stack

| Layer | Technology | Version/Config |
|-------|------------|----------------|
| Database | PostgreSQL (Supabase) | 15+ |
| Auth | Supabase Auth (GoTrue) | Email/password, email verification required, **rate limiting enabled (defaults)** |
| API | PostgREST (auto-generated) | RLS-enforced, anon key only |
| Serverless | Supabase Edge Functions (Deno) | TypeScript, import map |
| Storage | Supabase Storage (S3-compatible) | Private buckets, RLS policies |
| Realtime | Supabase Realtime | PostgreSQL logical replication |
| Migrations | Supabase CLI | `supabase migration new`, version-controlled |
| Types | `supabase gen types typescript` | Generated from live schema |
| Email (Auth) | Supabase built-in | Transactional emails (verify, reset, invite) |
| Notifications | In-app table + Realtime | Leave approval alerts, payroll updates |

---

## Commands

```bash
# Supabase local development
supabase start                    # Start local stack (Postgres, Auth, Realtime, Storage, Edge Functions)
supabase stop                     # Stop local stack
supabase status                   # Show service URLs and keys

# Database
supabase db reset                 # Reset DB, run all migrations, seed
supabase migration new <name>     # Create new migration file
supabase db push                  # Push migrations to linked project
supabase gen types typescript --local > src/types/database.ts  # Generate types

# Edge Functions
supabase functions new <name>     # Create new Edge Function
supabase functions deploy <name>  # Deploy to linked project
supabase functions serve <name>   # Serve locally with hot reload

# Testing
supabase test db                  # Run pgTAP tests (if configured)
npm test                          # Run unit/integration tests (Vitest)

# Lint/Format
deno fmt                          # Format Edge Functions
deno lint                         # Lint Edge Functions
```

---

## Project Structure

```
supabase/
├── config.toml                   # Supabase project config
├── migrations/                   # SQL migrations (numbered, version-controlled)
│   ├── 001_create_enums.sql
│   ├── 002_create_orgs_table.sql
│   ├── 003_create_profiles_table.sql
│   ├── 004_create_attendance_table.sql
│   ├── 005_create_leave_requests_table.sql
│   ├── 006_create_payroll_table.sql
│   ├── 007_create_audit_log_table.sql
│   ├── 008_create_notifications_table.sql
│   ├── 009_create_indexes.sql
│   ├── 010_create_functions.sql
│   ├── 011_enable_rls.sql
│   ├── 012_create_rls_policies.sql
│   ├── 013_create_triggers.sql
│   ├── 014_create_storage_buckets.sql
│   ├── 015_create_realtime_publications.sql
│   └── 016_seed_default_org.sql
├── functions/                    # Edge Functions (Deno/TypeScript)
│   ├── _shared/                  # Shared utilities
│   │   ├── cors.ts
│   │   ├── supabase-client.ts
│   │   ├── validation.ts
│   │   └── notification.ts       # Interface + in-app notification implementation
│   ├── payroll-update/           # Admin payroll update + notification
│   │   └── index.ts
│   ├── bulk-operations/          # Admin bulk actions / reports
│   │   └── index.ts
│   └── send-notification/        # Notification dispatch (uses interface)
│       └── index.ts
├── seed.sql                      # Development seed data
└── .env.local                    # Local env (not committed)

# Frontend types (generated, committed)
src/
└── types/
    └── database.ts               # Generated from `supabase gen types`
```

---

## Code Style

### SQL Migrations
- One logical change per migration file
- **Functions must be created BEFORE policies/triggers that reference them** (ordering: enums → tables → indexes → functions → RLS enable → policies → triggers → storage → realtime → seed)
- Use `DO $$ BEGIN ... END $$;` for idempotent operations
- Comment every table/column/policy with `COMMENT ON ... IS '...'`
- Name constraints explicitly: `CONSTRAINT chk_leave_date_range CHECK (end_date >= start_date)`
- Use `gen_random_uuid()` for UUID PKs, `bigserial` for audit log PK
- **All `SECURITY DEFINER` functions must check authorization as first statement** (e.g., `if not is_admin() then raise exception 'insufficient privilege'; end if;`)

```sql
-- Good: explicit, commented, idempotent
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid not null references orgs(id) default '00000000-0000-0000-0000-000000000001'::uuid,
  employee_code text unique not null,
  full_name text not null,
  role user_role not null default 'employee',
  -- ... other columns
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table profiles is 'Employee profile, mirrors auth.users 1:1';
comment on column profiles.org_id is 'Reserved for future multi-tenancy; defaults to single org';
```

### Edge Functions (TypeScript)
- Strict mode, no `any`, explicit return types
- Validate all inputs with Zod schemas
- Use shared Supabase client with service role for privileged ops
- Structured error responses: `{ error: { code, message, details? } }`
- Log with `console.log` (captured by Supabase logs)

```typescript
// Good: validated, typed, structured errors
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const UpdatePayrollSchema = z.object({
  employee_id: z.string().uuid(),
  base_salary: z.number().positive().optional(),
  allowances: z.number().min(0).optional(),
  deductions: z.number().min(0).optional(),
})

export default async function handler(req: Request) {
  if (req.method !== 'POST') return corsResponse(405, { error: { code: 'METHOD_NOT_ALLOWED' } })
  
  const body = await req.json()
  const parsed = UpdatePayrollSchema.safeParse(body)
  if (!parsed.success) return corsResponse(400, { error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } })
  
  // ... implementation
}

function corsResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}
```

---

## Testing Strategy

| Level | Tool | Scope | Coverage Target |
|-------|------|-------|-----------------|
| Unit (SQL) | pgTAP | Functions, triggers, RLS policies | 100% of custom functions |
| Unit (Edge) | Vitest + MSW | Edge Function logic, validation | 90%+ branches |
| Integration | Vitest + Supabase local | Full API flows (auth → RLS → data) | Critical paths |
| Contract | PostgREST introspection | Generated types match schema | 100% (CI enforced) |

**Test Organization:**
```
tests/
├── unit/
│   ├── sql/                      # pgTAP tests for functions/triggers
│   └── edge/                     # Vitest for Edge Functions
├── integration/
│   ├── auth-flow.test.ts         # Sign up → verify → sign in → RLS
│   ├── attendance-flow.test.ts   # Check-in/out, constraints, checkout guard
│   ├── leave-flow.test.ts        # Submit → approve/reject → audit → notification
│   ├── payroll-flow.test.ts      # Admin update → audit
│   └── notification-flow.test.ts # Notification RLS + realtime
└── fixtures/
    └── seed-test-data.sql        # Reusable test data
```

**CI Gates:**
- `supabase db reset` + `supabase gen types` must pass on every PR
- All tests must pass before merge
- Type generation failure = CI failure (catches schema drift)

---

## Boundaries

### Always
- Run `supabase db reset` + tests before committing migrations
- Generate types (`supabase gen types`) after every schema change
- Validate all Edge Function inputs with Zod
- Use service role key **only** in Edge Functions, never in client
- Write audit-triggered operations as atomic DB transactions

### Ask First
- Adding new tables or columns (impacts RLS, types, migrations)
- Changing RLS policies (security boundary)
- Adding new Edge Functions (attack surface)
- Modifying auth configuration (email templates, providers, rate limits)
- Storage bucket policy changes

### Never
- Commit service role key or JWT secrets
- Disable RLS on any table (even temporarily)
- Write client-side permission checks as the *only* enforcement
- Bypass audit triggers (no `SET session_replication_role = replica` in app code)
- Apply migrations manually via dashboard (always via CLI + version control)

---

## Success Criteria

### Database Schema
- [ ] All 7 tables created: `orgs`, `profiles`, `attendance`, `leave_requests`, `payroll`, `audit_log`, `notifications`
- [ ] Enums: `user_role`, `leave_type`, `leave_status`, `attendance_status`, `payment_status`
- [ ] Indexes on: `attendance(employee_id, work_date)`, `leave_requests(employee_id, status)`, `leave_requests(org_id, status)`, `audit_log(org_id, created_at desc)`, `payroll(employee_id)`, `notifications(user_id, read_at)`, `notifications(org_id, created_at desc)`
- [ ] `org_id` column on all tables (FK to `orgs`), no hardcoded default — seeded default org in `016_seed_default_org.sql`
- [ ] `payroll` table (per architecture plan): `employee_id` (unique), `base_salary`, `allowances`, `deductions`, `currency` (default 'INR'), `effective_from`, `updated_by`, `updated_at`
- [ ] `notifications` table: `org_id`, `user_id`, `type`, `title`, `message`, `read_at`, `created_at`

### RLS Policies
- [ ] All 7 tables have `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- [ ] Default-deny: no policies = no access
- [ ] `is_admin()` helper function (security definer)
- [ ] Profiles: self-read, self-edit-limited (address/phone/picture), admin-full
- [ ] Attendance: own rows (select/insert), **own check-out (update `check_out` only, same-day)**, admin-manage
- [ ] Leave: own create/read, admin review (update)
- [ ] Payroll: own read, admin write/update
- [ ] Audit log: admin read-only, no client writes
- [ ] Notifications: own read (where user_id = auth.uid()), admin read-all (where org_id matches)

### Triggers
- [ ] `updated_at` auto-update on `profiles`, `leave_requests`
- [ ] `profiles_column_guard` BEFORE UPDATE (blocks role/employee_code/job_title/department changes for non-admins)
- [ ] `attendance_checkout_guard` BEFORE UPDATE (allows only `check_out` column change, same-day only, for non-admins)
- [ ] `leave_audit` AFTER UPDATE on `leave_requests` (logs status changes with actor, comment, creates notification)

### Postgres Functions
- [ ] `is_admin()` → boolean (security definer, stable)
- [ ] `get_leave_balance(employee_id, leave_type, year)` → integer (approved days taken; **checks caller is employee or admin**)
- [ ] `get_dashboard_stats(org_id)` → jsonb (aggregated counts for admin dashboard; **checks `is_admin()` as first statement**)
- [ ] **All `SECURITY DEFINER` functions enforce authorization as first executable statement** (raise exception if check fails)

### Edge Functions
- [ ] `payroll-update` — Admin updates payroll, creates in-app notification, audit (service role)
- [ ] `bulk-operations` — Admin bulk actions (bulk leave approve, reports)
- [ ] `send-notification` — **In-app notification dispatch** (writes to `notifications` table; email provider pluggable later)

### Storage
- [ ] Bucket `profile-pictures` (private, per-user folder via RLS)
- [ ] Bucket `documents` (private, per-user folder via RLS, **allowed: PDF, JPG, JPEG, PNG, DOCX; max 10MB**)

### Realtime
- [ ] Publication for `leave_requests` (status changes)
- [ ] Publication for `attendance` (check-in/out)
- [ ] Publication for `notifications` (live dashboard alerts)

### Verification
- [ ] `supabase db reset` succeeds cleanly
- [ ] `supabase gen types` produces valid TypeScript
- [ ] All pgTAP tests pass
- [ ] All Edge Function tests pass
- [ ] Integration tests cover: auth → RLS → data flows for employee + admin

---

## Architectural Decisions (Resolved)

| # | Decision | Resolution |
|---|----------|------------|
| 1 | **Default org UUID** | Single org: `00000000-0000-0000-0000-000000000001` (placeholder UUID, seeded in migration) |
| 2 | **Auth email verification** | Supabase Auth built-in; email verification required before sign-in |
| 3 | **Auth rate limiting** | Enabled (Supabase defaults: 360 req/hour IP, 30 req/hour email) |
| 4 | **Notifications (MVP)** | **In-app notifications table + Realtime**; Supabase Auth built-in emails only for auth events (verify, reset, invite) |
| 5 | **Payroll scope** | **Simple `payroll` table per architecture plan** (current state only); monthly processing explicitly **out of scope for v1.0** (PRD §2.2) |
| 6 | **Leave accrual** | **Out of scope for v1.0** (PRD §4.5 only covers submit/approve/reject); balance queries return approved days taken only |
| 7 | **Document storage** | Bucket `documents`; allowed: PDF, JPG, JPEG, PNG, DOCX; max 10MB/file |
| 8 | **Storage bucket policies** | Per-user folder (`user_id/`); RLS policies enforce ownership |
| 9 | **Attendance status** | Enum `attendance_status` (`present`, `absent`, `half_day`, `leave`) — consistent with other enums |
| 10 | **Check-out policy** | Employee can update own `check_out` same-day only (via trigger guard); admin full manage |
