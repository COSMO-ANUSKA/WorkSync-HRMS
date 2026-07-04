# Implementation Plan: WorkSync-HRMS Frontend - Missing Architecture & Features

## Overview

Close the architecture gap between current implementation and the Feature-First specification, then implement all missing employee/admin views with real Supabase data, TanStack Query caching, proper auth flow, and comprehensive test coverage.

## Architecture Decisions

- **Feature-First Structure**: Migrate from flat app-routes to `src/features/*` with repositories, services, hooks, components
- **RSC-First**: All page.tsx and layout.tsx remain Server Components; only interactive widgets use `'use client'`
- **TanStack Query v5**: Centralized server-state management with offline persistence via IndexedDB
- **Zod + React Hook Form**: All forms validated via shared schema contracts
- **Middleware Auth**: `@supabase/ssr` middleware for route guards with DB-backed role checks

---

## Task List

### Phase 1: Foundation & Architecture Scaffold

#### Task 1: Create Feature-First Directory Structure
**Description:** Scaffold `src/features/` with the standard module template for each domain.
**Acceptance criteria:**
- [ ] `src/features/{auth,attendance,leave,profile,payroll,notifications,admin,audit}/` exist
- [ ] Each feature has `components/`, `hooks/`, `services/`, `repositories/`, `schemas/`, `types/`, `utils/`, `__tests__/`
- [ ] Shared layer unchanged; lib layer has supabase clients
**Dependencies:** None
**Files:** Directory structure only
**Scope:** S

#### Task 2: Supabase SSR Client & Types Setup
**Description:** Replace mock client with proper `@supabase/ssr` browser + server clients; generate types from backend.
**Acceptance criteria:**
- [ ] `src/lib/supabase/client.ts` — `createBrowserClient<Database>` with proper types
- [ ] `src/lib/supabase/server.ts` — `createServerClient<Database>` for RSC/middleware
- [ ] `src/lib/supabase/functions.ts` — Edge Function invoker
- [ ] `src/types/database.ts` generated from `supabase gen types`
- [ ] No `as any` in client code
**Dependencies:** Task 1
**Files:** `src/lib/supabase/*.ts`, `src/types/database.ts`
**Scope:** M

#### Task 3: TanStack Query Provider & Config
**Description:** Add QueryProvider with persistence, offline-first network mode, and global query defaults.
**Acceptance criteria:**
- [ ] `src/shared/providers/QueryProvider.tsx` wraps app with `PersistQueryClientProvider`
- [ ] Default options: `staleTime: 10min`, `gcTime: 24h`, `networkMode: 'offlineFirst'`
- [ ] LocalStorage persister for offline cache
- [ ] Offline banner component in root layout
- [ ] `useQueryClient` hook re-exported from shared
**Dependencies:** Task 2
**Files:** `src/shared/providers/QueryProvider.tsx`, `src/shared/hooks/useQueryClient.ts`
**Scope:** M

#### Task 4: Middleware Auth Guards
**Description:** Implement `middleware.ts` with `@supabase/ssr` cookie handling, DB role lookup, and route protection.
**Acceptance criteria:**
- [ ] `middleware.ts` at `src/app/middleware.ts`
- [ ] Redirects unauthenticated → `/login`
- [ ] Redirects non-admin from `/admin/*` → `/dashboard`
- [ ] Redirects authenticated from `/login`, `/activate` → `/dashboard`
- [ ] Role fetched from `profiles` table (not JWT metadata)
- [ ] Cookie handling per `@supabase/ssr` pattern
**Dependencies:** Task 2
**Files:** `src/app/middleware.ts`
**Scope:** M

---

### Checkpoint: Foundation Complete
- [ ] App builds without errors
- [ ] Middleware protects routes (tested manually)
- [ ] QueryProvider wraps all client components
- [ ] Types generated and used

---

### Phase 2: Auth Vertical Slice (Login → Activate → Dashboard)

#### Task 5: Auth Feature Module
**Description:** Build the auth feature with repositories, schemas, and UI components.
**Acceptance criteria:**
- [ ] `src/features/auth/schemas/authSchemas.ts` — Zod schemas for login, activate, reset
- [ ] `src/features/auth/repositories/authRepository.ts` — `signIn`, `updatePassword`, `resetPassword`
- [ ] `src/features/auth/hooks/useAuth.ts` — `useSignIn`, `useActivate`, `useResetPassword` mutations
- [ ] `src/features/auth/components/LoginForm.tsx`, `ActivateForm.tsx`, `ResetPasswordForm.tsx`
- [ ] All forms use RHF + Zod resolver
**Dependencies:** Task 2, Task 3
**Files:** `src/features/auth/**`
**Scope:** L (split into 5a-5d if needed)

#### Task 6: Auth Route Pages
**Description:** Create the three auth pages under `(auth)` route group.
**Acceptance criteria:**
- [ ] `src/app/(auth)/layout.tsx` — centered glassmorphic card wrapper
- [ ] `src/app/(auth)/login/page.tsx` — Server Component rendering `<LoginForm />`
- [ ] `src/app/(auth)/activate/page.tsx` — Server Component rendering `<ActivateForm />`
- [ ] `src/app/(auth)/reset-password/page.tsx` — Server Component rendering `<ResetPasswordForm />`
- [ ] Pages use RSC (no `'use client'` on page.tsx)
- [ ] Forms are Client Components
**Dependencies:** Task 5
**Files:** `src/app/(auth)/**`
**Scope:** M

#### Task 7: Employee Dashboard — Real Data
**Description:** Replace mock dashboard with real Supabase queries via TanStack Query.
**Acceptance criteria:**
- [ ] `src/features/dashboard/repositories/dashboardRepository.ts` — `getAttendanceToday`, `getLeaveBalance`, `getPayrollSummary`
- [ ] `src/features/dashboard/hooks/useDashboard.ts` — queries with proper keys and staleTime
- [ ] `src/features/dashboard/components/CheckInWidget.tsx` — optimistic check-in/out mutation
- [ ] `src/features/dashboard/components/StatusCards.tsx` — three live cards
- [ ] `src/app/(employee)/dashboard/page.tsx` — RSC fetching initial data, passes to Client Components
- [ ] Real-time clock using `useEffect` + `setInterval`
**Dependencies:** Task 3, Task 4
**Files:** `src/features/dashboard/**`, `src/app/(employee)/dashboard/page.tsx`
**Scope:** L

---

### Checkpoint: Auth + Dashboard Working
- [ ] Login → dashboard flow works end-to-end
- [ ] Check-in/out persists to DB and updates UI optimistically
- [ ] Leave balance card shows real count
- [ ] No console errors

---

### Phase 3: Employee Core Features

#### Task 8: Profile Feature Module
**Description:** Profile management with avatar upload, document handling, and editable details.
**Acceptance criteria:**
- [ ] `src/features/profile/schemas/profileSchemas.ts` — Zod for profile update
- [ ] `src/features/profile/repositories/profileRepository.ts` — `getProfile`, `updateProfile`, `uploadAvatar`, `uploadDocument`, `deleteDocument`, `listDocuments`
- [ ] `src/features/profile/hooks/useProfile.ts` — queries + mutations
- [ ] `src/features/profile/components/AvatarUpload.tsx`, `DocumentManager.tsx`, `ProfileForm.tsx`
- [ ] `src/app/(employee)/profile/page.tsx` — RSC layout with split panels
- [ ] Supabase Storage uploads to `profile-pictures/{userId}/` and `documents/{userId}/`
- [ ] File validation (10MB, PDF/JPG/PNG/DOCX) before upload
**Dependencies:** Task 3
**Files:** `src/features/profile/**`, `src/app/(employee)/profile/page.tsx`
**Scope:** L

#### Task 9: Attendance Feature Module
**Description:** Monthly calendar with real attendance data and tooltips.
**Acceptance criteria:**
- [ ] `src/features/attendance/repositories/attendanceRepository.ts` — `getMonthlyAttendance`, `getTodayAttendance`
- [ ] `src/features/attendance/hooks/useAttendance.ts` — queries with month-based keys
- [ ] `src/features/attendance/components/AttendanceCalendar.tsx` — grid with hover tooltips
- [ ] `src/app/(employee)/attendance/page.tsx` — RSC, passes initial month data to Client Component
- [ ] Month navigation invalidates and refetches
**Dependencies:** Task 3
**Files:** `src/features/attendance/**`, `src/app/(employee)/attendance/page.tsx`
**Scope:** M

#### Task 10: Leave Feature Module
**Description:** Leave history table + sliding drawer with full validation.
**Acceptance criteria:**
- [ ] `src/features/leave/schemas/leaveSchemas.ts` — Zod for leave request (date validation)
- [ ] `src/features/leave/repositories/leaveRepository.ts` — `getLeaveHistory`, `createLeaveRequest`, `cancelLeaveRequest`
- [ ] `src/features/leave/hooks/useLeave.ts` — queries + mutations with invalidation
- [ ] `src/features/leave/components/LeaveTable.tsx`, `LeaveRequestDrawer.tsx`
- [ ] `src/app/(employee)/leave/page.tsx` — RSC, table + drawer as Client Components
- [ ] Drawer slides from right, backdrop blur, form validation
**Dependencies:** Task 3
**Files:** `src/features/leave/**`, `src/app/(employee)/leave/page.tsx`
**Scope:** M

#### Task 11: Notifications Feature Module
**Description:** Notification center drawer + realtime subscription.
**Acceptance criteria:**
- [ ] `src/features/notifications/repositories/notificationRepository.ts` — `getNotifications`, `markAsRead`, `markAllAsRead`
- [ ] `src/features/notifications/hooks/useNotifications.ts` — query + realtime subscription
- [ ] `src/features/notifications/components/NotificationDrawer.tsx`, `NotificationBell.tsx`
- [ ] Bell in mobile bottom nav + desktop header shows unread count badge
- [ ] Realtime subscription on `notifications` table invalidates query
- [ ] "Mark all as read" bulk update
**Dependencies:** Task 3
**Files:** `src/features/notifications/**`
**Scope:** M

---

### Checkpoint: Employee Portal Complete
- [ ] All 4 employee pages work with real data
- [ ] Profile avatar/document upload works
- [ ] Leave requests create real DB rows
- [ ] Notifications appear realtime

---

### Phase 4: Admin Portal

#### Task 12: Admin Feature Module — Core
**Description:** Shared admin repositories, hooks, and layout.
**Acceptance criteria:**
- [ ] `src/features/admin/repositories/adminRepository.ts` — `getEmployees`, `inviteEmployee`, `terminateEmployee`, `getDashboardStats`, `getAuditLogs`
- [ ] `src/features/admin/hooks/useAdmin.ts` — admin queries/mutations
- [ ] `src/app/(admin)/layout.tsx` — Admin sidebar + header (separate from employee)
- [ ] Admin middleware guard already prevents access
**Dependencies:** Task 4
**Files:** `src/features/admin/**`, `src/app/(admin)/layout.tsx`
**Scope:** M

#### Task 13: Admin Dashboard
**Description:** KPI cards, realtime activity feed, attendance gauge.
**Acceptance criteria:**
- [ ] `src/features/admin/components/AdminKPICards.tsx`, `ActivityFeed.tsx`, `AttendanceGauge.tsx`
- [ ] `src/app/(admin)/dashboard/page.tsx` — RSC with Suspense boundaries
- [ ] KPIs: total employees, checked-in today, pending leaves, payroll liability
- [ ] Activity feed subscribes to `attendance` + `leave_requests` realtime
- [ ] Attendance gauge ring (SVG radial progress)
**Dependencies:** Task 12
**Files:** `src/features/admin/**`, `src/app/(admin)/dashboard/page.tsx`
**Scope:** L

#### Task 14: Employee Directory + Invite Modal
**Description:** Searchable, filterable directory with invite employee modal.
**Acceptance criteria:**
- [ ] `src/features/admin/components/EmployeeDirectory.tsx`, `InviteEmployeeModal.tsx`
- [ ] `src/app/(admin)/employees/page.tsx` — RSC with table
- [ ] Search by name/code, filter by department/role
- [ ] Pagination (PostgREST range headers)
- [ ] Invite modal calls Edge Function `/functions/v1/invite-employee`
- [ ] Edge Function creates profile + triggers auth invite email
**Dependencies:** Task 12
**Files:** `src/features/admin/**`, `src/app/(admin)/employees/page.tsx`
**Scope:** L

#### Task 15: Employee Detail + Payroll Config
**Description:** Admin view of single employee with tabs (Profile, Attendance, Payroll).
**Acceptance criteria:**
- [ ] `src/features/admin/components/EmployeeDetailTabs.tsx`, `PayrollConfigForm.tsx`
- [ ] `src/app/(admin)/employees/[id]/page.tsx` — RSC with tabs
- [ ] Profile tab: all fields editable, save calls `profiles.update`
- [ ] Attendance tab: monthly log, manual correction button (admin upsert)
- [ ] Payroll tab: base/allowances/deductions/effective_date, upsert to `payroll` table
- [ ] Payroll upsert triggers Edge Function `/functions/v1/payroll-update` for notification
**Dependencies:** Task 12
**Files:** `src/features/admin/**`, `src/app/(admin)/employees/[id]/page.tsx`
**Scope:** L

#### Task 16: Leave Approvals
**Description:** Pending queue with approve/reject actions and rejection comment modal.
**Acceptance criteria:**
- [ ] `src/features/admin/components/LeaveApprovalsTable.tsx`, `RejectModal.tsx`
- [ ] `src/app/(admin)/leave-approvals/page.tsx` — RSC
- [ ] Table shows all `status='pending'` requests
- [ ] Approve button → `leave_requests.update({status:'approved'})`
- [ ] Reject button → modal with required comment (min 10 chars) → update with `status='rejected'`, `reviewer_comment`
- [ ] Both actions invalidate leave queries + send notification
**Dependencies:** Task 12
**Files:** `src/features/admin/**`, `src/app/(admin)/leave-approvals/page.tsx`
**Scope:** M

#### Task 17: Audit Log Viewer
**Description:** Paginated, searchable audit log table with JSON metadata viewer.
**Acceptance criteria:**
- [ ] `src/features/audit/repositories/auditRepository.ts` — `getAuditLogs` with pagination/filters
- [ ] `src/features/audit/hooks/useAudit.ts` — query with page/sort keys
- [ ] `src/features/audit/components/AuditTable.tsx`, `MetadataViewer.tsx`
- [ ] `src/app/(admin)/audit/page.tsx` — RSC
- [ ] Columns: timestamp (mono), actor (link to employee), action type (color pill), target entity, metadata (collapsible JSON tree)
- [ ] Server-side pagination via PostgREST `range` header
- [ ] Filters: date range, actor, action type
**Dependencies:** Task 12
**Files:** `src/features/audit/**`, `src/app/(admin)/audit/page.tsx`
**Scope:** M

---

### Checkpoint: Admin Portal Complete
- [ ] All admin pages accessible only to admin role
- [ ] Employee invite creates auth user + profile
- [ ] Leave approve/reject works with notifications
- [ ] Audit logs paginate correctly

---

### Phase 5: Cross-Cutting Concerns & Polish

#### Task 18: Loading Skeletons & Error Boundaries
**Description:** Add skeleton loaders for all lists/tables/cards; route-level error boundaries.
**Acceptance criteria:**
- [ ] `src/shared/ui/Skeleton.tsx` — variants for card, table row, avatar, text
- [ ] `src/app/(employee)/error.tsx`, `src/app/(admin)/error.tsx` — friendly error UI with retry
- [ ] All Suspense boundaries in RSC pages use correct skeleton
- [ ] No layout shift on load
**Dependencies:** Phase 2-4
**Files:** `src/shared/ui/Skeleton.tsx`, `src/app/*/error.tsx`
**Scope:** M

#### Task 19: Toast System & Offline Banner
**Description:** Global toast provider + offline detection banner.
**Acceptance criteria:**
- [ ] `src/shared/providers/ToastProvider.tsx` — portal-based toasts (success/error/info)
- [ ] `src/shared/components/OfflineBanner.tsx` — shows when `navigator.onLine === false`
- [ ] Toasts used for all mutations (leave submit, check-in, admin actions)
- [ ] Offline banner disables mutation buttons
**Dependencies:** Task 3
**Files:** `src/shared/providers/ToastProvider.tsx`, `src/shared/components/OfflineBanner.tsx`
**Scope:** M

#### Task 20: Accessibility Audit & Fixes
**Description:** Ensure WCAG 2.1 AA compliance across all interactive elements.
**Acceptance criteria:**
- [ ] All icon buttons have `aria-label`
- [ ] All inputs have matching `<label htmlFor>`
- [ ] Modals/drawers trap focus, restore on close
- [ ] Color contrast ≥ 4.5:1 (verify with automated tool)
- [ ] Alt text on all images/avatars
- [ ] Keyboard navigation works for all flows
**Dependencies:** Phase 2-4
**Files:** Cross-cutting
**Scope:** M

---

### Phase 6: Testing

#### Task 21: Unit Tests (Vitest + RTL)
**Description:** Test shared UI primitives, feature hooks, validation schemas.
**Acceptance criteria:**
- [ ] `tests/unit/shared/` — Button, Input, Badge, Table, Modal rendering + interactions
- [ ] `tests/unit/features/auth/` — form validation, mutation success/error
- [ ] `tests/unit/features/leave/` — drawer open/close, date validation
- [ ] `tests/unit/features/admin/` — directory search/filter, modal open
- [ ] MSW handlers mock Supabase client
- [ ] `npm run test:unit` passes
**Dependencies:** Phase 2-4
**Files:** `tests/unit/**`
**Scope:** L

#### Task 22: Integration Tests (TanStack Query)
**Description:** Test query cache behavior, optimistic updates, invalidation.
**Acceptance criteria:**
- [ ] `tests/integration/queryCache.test.ts` — check-in optimistic update rollback
- [ ] `tests/integration/prefetch.test.ts` — hover prefetch warms cache
- [ ] `tests/integration/realtime.test.ts` — realtime event triggers invalidation
- [ ] `npm run test:integration` passes
**Dependencies:** Task 21
**Files:** `tests/integration/**`
**Scope:** M

#### Task 23: E2E Tests (Playwright)
**Description:** Critical user flows in real browser.
**Acceptance criteria:**
- [ ] `tests/e2e/auth.spec.ts` — invite activation → set password → login → dashboard
- [ ] `tests/e2e/attendance.spec.ts` — check-in → check-out → gauge updates
- [ ] `tests/e2e/admin.spec.ts` — invite employee → appears in directory → terminate
- [ ] `tests/e2e/leave.spec.ts` — submit leave → admin approve → notification appears
- [ ] `npx playwright test` passes
**Dependencies:** Task 21
**Files:** `tests/e2e/**`
**Scope:** L

---

### Checkpoint: Testing Complete
- [ ] All test suites pass
- [ ] Coverage ≥ 80% on shared + feature hooks
- [ ] E2E flows recorded

---

### Phase 7: Performance & Final Verification

#### Task 24: Bundle Analysis & Optimization
**Description:** Verify bundle budget, remove unused deps, enable RSC where possible.
**Acceptance criteria:**
- [ ] `npm run build` succeeds
- [ ] `npm run analyze` (next-bundle-analyzer) shows <150KB gzipped initial JS per page
- [ ] No page.tsx marked `'use client'` unnecessarily
- [ ] Heavy libs (framer-motion, chart.js) only in Client Components
**Dependencies:** Phase 2-4
**Files:** `next.config.js`, imports audit
**Scope:** M

#### Task 25: Final Manual Verification
**Description:** Run through all user flows in local Supabase stack.
**Acceptance criteria:**
- [ ] Employee: login → check-in → leave request → profile upload → notifications
- [ ] Admin: login → dashboard KPIs realtime → invite employee → approve leave → audit logs
- [ ] Offline: disconnect network → cached data visible → banner shows → reconnect syncs
- [ ] No console errors/warnings
**Dependencies:** All previous
**Files:** N/A (manual)
**Scope:** M

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Supabase realtime subscription complexity | High | Start with simple query invalidation; add realtime incrementally |
| Offline persistence conflicts | Medium | Use `networkMode: 'offlineFirst'` with short `staleTime`; test thoroughly |
| RSC + Client Component boundary leaks | High | Enforce via lint rule; never mark page.tsx as client |
| Admin invite Edge Function not deployed | Medium | Mock Edge Function in dev; verify in staging |
| Bundle size exceeds budget | Medium | Audit with analyzer early; prefer native browser APIs |

---

## Open Questions

1. **Edge Function endpoints**: Are `/invite-employee`, `/terminate-employee`, `/payroll-update` already deployed in the backend spec? (Backend spec lists `bulk-operations`, `payroll-update`, `send-notification` — invite/terminate may need adding)
2. **Realtime scale**: Admin activity feed subscribes to two tables; confirm row count won't exceed Supabase realtime limits
3. **Date handling**: Spec uses `YYYY-MM-DD` strings; ensure timezone consistency between client/server
4. **Avatar upload**: Backend spec says `profile-pictures` bucket with per-user folder — confirm RLS policies allow user upload to own folder

---

## Parallelization Opportunities

- **Safe to parallelize**: Tasks 8, 9, 10, 11 (independent employee features); Tasks 13-17 (admin features after 12); Tasks 21-23 (test layers)
- **Must be sequential**: 1→2→3→4→5→6→7; 12→13-17
- **Needs coordination**: Feature module interfaces (repository signatures) should be agreed before parallel work