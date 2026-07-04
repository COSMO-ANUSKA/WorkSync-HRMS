# WorkSync-HRMS Project Rules

## 1. Architectural Stack & API Boundaries
- **Tech Stack:** Next.js (Frontend SPA/SSR) -> Go Backend (API, Business logic, Orchestration) -> Supabase (Postgres, Auth, Storage, Realtime).
- **Mutation Boundary:** The frontend MUST NOT perform database mutations (INSERT/UPDATE/DELETE) directly via the Supabase client SDK. All business-critical actions (leave approvals, payroll configuration, attendance checks, profile updates) must route through Go Backend API endpoints (e.g., `/api/attendance`, `/api/leave`, `/api/payroll`, `/api/employees`).
- **Supabase SDK Usage:** The Supabase client SDK is restricted in the frontend to:
  - Authenticated queries (reads) protected by Database RLS.
  - Realtime logical replication subscriptions (e.g., live attendance tracking).
  - Storage bucket file uploads (utilizing signed URLs or RLS folders).

## 2. Supabase Integration Invariants
- **Library Selection:** Never use the deprecated `@supabase/auth-helpers-nextjs`. Always use the modern `@supabase/ssr` helpers to manage user sessions and cookies inside Next.js middleware and API boundaries.
- **Role Enforcement:** User roles (`admin`, `employee`) must be sourced from the Postgres database `profiles` table rather than user metadata in JWTs, protecting against JWT state drift.
- **Tenant Context:** Never hardcode default organization UUIDs. Extract the active `org_id` / `organization_id` dynamically from the user profile, JWT custom claims, or server-side tenant context.

## 3. Onboarding & Registration Flow
- **Invite-only System:** The application does not support public registrations.
- **Workflow:** Admin creates the profile -> Server triggers an auth invite email -> Employee clicks link -> Employee sets password -> Employee logs in.

## 4. Frontend Engineering Quality Standards
- **Form Validation:** Every form mutation (login, activation, leave request, profile edit, payroll updates) MUST use **Zod** schemas paired with **React Hook Form** to enforce client-side type-safety and visual inline errors.
- **Dynamic Data Invariant:** Do not commit hardcoded/static JSON list arrays in page components. All views must consume real-time subscriptions, TanStack Query cached API hooks, or server-side queries.
- **Offline & Local Resilience:** Design forms and lists to withstand offline state conditions. Cache queries locally using TanStack Query with appropriate `staleTime` (defaults: 1 min) and implement optimistic UI state updates for high-impact user actions.

## 5. Scope Alignment & PRD Invariants
- **PRD Dominance:** The Product Requirements Document (and the corresponding `BACKEND_SPEC.md` resolutions) defines the absolute feature boundary.
- **Out-of-Scope Elements:** Do not introduce UI components or actions that mutate records or run calculations not supported by the database schema. If a feature (e.g. monthly payroll runs, announcements, holidays) is included for navigation or layout structure, it must be explicitly marked as `[OPTIONAL / Future Enhancement - Out of Scope for v1.0]`.
