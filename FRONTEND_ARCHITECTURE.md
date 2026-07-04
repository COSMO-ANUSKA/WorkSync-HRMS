# WorkSync-HRMS Frontend Engineering Architecture Handbook

This handbook serves as the master architectural guide and reference for the WorkSync-HRMS Next.js frontend. It defines the folder conventions, interface boundaries, patterns, and quality standards for all engineering contributors in a **pure Supabase** backend environment.

---

## 1. Architecture Principles

To build a codebase that remains maintainable as it grows, we follow these core architectural principles:

- **RSC-First Architecture:** All routes, page layouts, grids, and lists must be Server Components unless they require user interaction (e.g., check-in actions) or browser APIs.
  - *Why:* Keeps client-side JavaScript minimal, optimizes load times (First Contentful Paint < 1.0s), and improves security by bypassing the exposure of data fetching logic.
- **Feature-First Organization:** Files are colocated under feature modules (e.g., `features/attendance`) rather than generic global layer folders.
  - *Why:* Simplifies feature refactoring or removal. Engineers can understand and modify all components, services, and hooks of a feature within a single folder.
- **Composition over Inheritance:** Compose page layouts and complex widgets from shared, stateless primitive components.
  - *Why:* Avoids complex property overrides and configuration drifts in core UI widgets.
- **Colocation of Concerns:** Place tests, types, utilities, and assets of a feature within that feature's directory.
  - *Why:* Keeps imports localized, reducing lookup times and keeping files focused.
- **Single Responsibility Principle (SRP):** Separate data fetching (repositories), state caching (React Query hooks), layout structure, and visual rendering (primitives) into distinct files.
  - *Why:* Allows components to be modular, testable with mocks, and easily refactored.
- **No Hidden Side Effects:** State mutations must be explicit. Avoid writing `useEffect` blocks that trigger state updates or fetch operations behind the scenes.

---

## 2. Dependency Rules

We enforce a strict layered dependency structure to prevent circular dependencies and control coupling.

```
┌────────────────────────────────────────┐
│               APP LAYER                │
│    (src/app/* - Layouts & Routes)     │
└───────────────────┬────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│             FEATURE LAYER              │
│    (src/features/* - Domain Logic)     │
└───────────────────┬────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│              SHARED LAYER              │
│    (src/shared/* - Common Utils)       │
└───────────────────┬────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│               LIB LAYER                │
│   (src/lib/* - SDKs, Supabase Config)  │
└────────────────────────────────────────┘
```

### 2.1 Layer Ownership and Rules
- **App Layer:** Owns App Router configurations, routes, nested layouts, `loading.tsx` and `error.tsx` handlers.
  - *Allowed Imports:* Features, Shared, Lib.
  - *Forbidden:* Cannot be imported by any other layer.
- **Feature Layer:** Owns business domain logic (e.g., `auth`, `attendance`, `leave`, `payroll`, `profile`, `notifications`, `audit`, `admin`).
  - *Allowed Imports:* Shared, Lib.
  - *Forbidden:* Features **cannot import other features** directly. If communication is required, it must route through Shared primitives, query key triggers, or the App layer.
- **Shared Layer:** Owns reusable presentation elements (`shared/ui`), hooks, and base utilities.
  - *Allowed Imports:* Lib.
  - *Forbidden:* Cannot import Features or App files.
- **Lib Layer:** Owns Supabase clients configurations (`lib/supabase`).
  - *Allowed Imports:* Third-party npm dependencies.
  - *Forbidden:* Cannot import any application layers (App, Features, Shared).

---

## 3. Feature Module Architecture

All domain-specific code is organized inside `src/features/[feature_name]/`:

```
src/features/attendance/
├── components/             # Feature UI components (e.g., CheckInWidget.tsx)
├── hooks/                  # Feature custom React Query hooks (e.g., useCheckIn.ts)
├── services/               # Logic orchestrations (e.g., AttendanceService.ts)
├── repositories/           # Supabase direct data fetch definitions (e.g., AttendanceRepository.ts)
├── schemas/                # Zod schemas (e.g., attendanceSchema.ts)
├── constants/              # Feature-scoped configuration constants
├── types/                  # Domain specific custom TypeScript contracts
├── utils/                  # Domain utility functions
└── __tests__/              # Unit and integration tests (MSW mocked)
```

### 3.1 Ownership Matrix
- The owner of `src/features/attendance/` is the Feature Developer.
- Components in this folder may be imported by page templates under `src/app/(employee)/attendance/page.tsx`, but never by components in `src/features/leave/`.

---

## 4. Shared Layer

The shared directory (`src/shared/`) holds elements that are domain-agnostic:

- **`shared/ui/`:** Presentational components (Button, Input, Badge, Table, Modal, Drawer, Toast, skeletons).
- **`shared/hooks/`:** Base hooks (`useOffline`, `useDebounce`, `useTheme`).
- **`shared/lib/`:** Shared configurations and base query client options.
- **`shared/providers/`:** Query client providers, theme context providers.
- **`shared/constants/`:** Global configurations, theme tokens, error codes.
- **`shared/utils/`:** Date formatters (`formatDate`), currency formatters (`formatCurrency`).
- **`shared/types/`:** Global utility types.

---

## 5. App Router Architecture

We leverage Next.js App Router for layouts, layout nesting, and route-group separation.

```
src/app/
├── (auth)/                  # Route group for sign-in & invite onboarding
│   ├── layout.tsx           # Centered glassmorphic card backdrop wrapper
│   ├── login/page.tsx       # Login route
│   └── activate/page.tsx    # Password setup activation route
├── (employee)/              # Route group for staff portal
│   ├── layout.tsx           # Mobile BottomNav and Desktop Sidebar wrapper
│   ├── dashboard/page.tsx   # Dashboard widgets
│   └── leave/page.tsx       # Sliding request drawer & table
└── (admin)/                 # Route group for HR dashboards
    ├── layout.tsx           # Admin-specific navigation layouts
    ├── employees/page.tsx   # Searchable directory table
    └── audit/page.tsx       # Audit viewer pagination log
```

- **Streaming & Suspense:** Wrap client-dependent feature modules (e.g., CheckInWidget, Employee Directory) in React `<Suspense fallback={<TableSkeleton />}>` boundaries inside RSC pages.
- **Error/Loading Boundary placement:** Place `loading.tsx` and `error.tsx` at the root of route groups to catch and display styled crash layouts.

---

## 6. Server Component Strategy

RSCs render on the server, generating lightweight HTML with zero bundle overhead.

- **RSC Rules:**
  - Page templates (`page.tsx`) must always be Server Components.
  - Page layouts (`layout.tsx`) must always be Server Components.
  - RSCs may read directly from Supabase during initial render.
- **RSC Code Blueprint:**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { EmployeeTable } from '@/features/profile/components/EmployeeTable'

export default async function AdminEmployeesPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: employees } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Employees</h1>
      <EmployeeTable initialData={employees || []} />
    </div>
  )
}
```

---

## 7. Client Component Strategy

Client Components (`'use client'`) add interactivity. They form leaf nodes of the component tree.

- **Must Be Client Components:**
  - Slide-out drawers and modals.
  - Forms using `react-hook-form` and validation resolvers.
  - Interactivity controls (buttons that trigger mutations).
  - Components consuming browser APIs (e.g., check-in digital clock timer).
- **Client Boundary Rule:** Shift the `'use client'` boundary as far down the DOM tree as possible. Never mark a page `page.tsx` as a Client Component.

---

## 8. Repository Layer

The Repository Layer abstracts data access from the UI, interacting directly with Supabase via PostgREST.

```
┌──────────────────────────────────────┐
│            SERVICE LAYER             │
│       (AttendanceService.ts)         │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│           REPOSITORY LAYER           │
│     (AttendanceRepository.ts)        │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│      SUPABASE JS SDK CLIENT          │
│       (Direct PostgREST)             │
└──────────────────────────────────────┘
```

Client-side repositories read and mutate through Supabase/PostgREST only. Do not route MVP CRUD through a second app API unless the backend spec explicitly requires it.

### 8.1 Example Interface: LeaveRepository
```typescript
export interface ILeaveRepository {
  getLeaves(employeeId: string): Promise<Leave[]>
  createLeave(payload: CreateLeaveInput): Promise<Leave>
  cancelLeave(leaveId: string): Promise<void>
}

export class LeaveRepository implements ILeaveRepository {
  async getLeaves(employeeId: string): Promise<Leave[]> {
    const { supabase } = await import('@/lib/supabase/client')
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('employee_id', employeeId)
    if (error) throw error
    return data as Leave[]
  }

  async createLeave(payload: CreateLeaveInput): Promise<Leave> {
    const { supabase } = await import('@/lib/supabase/client')
    const { data, error } = await supabase
      .from('leave_requests')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data as Leave
  }

  async cancelLeave(leaveId: string): Promise<void> {
    const { supabase } = await import('@/lib/supabase/client')
    const { error } = await supabase
      .from('leave_requests')
      .delete()
      .eq('id', leaveId)
    if (error) throw error
  }
}
```

---

## 9. Service Layer

Services coordinate business logic, storage actions, and trigger orchestrations.

### 9.1 Storage Service Blueprint (Supabase Storage)
```typescript
import { supabase } from '@/lib/supabase/client'

export class StorageService {
  async uploadProfilePicture(userId: string, file: File): Promise<string> {
    const filePath = `profile-pictures/${userId}/avatar.png`
    
    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(filePath, file, { upsert: true })

    if (uploadError) throw uploadError

    // Synchronize profiles table
    const { error: dbError } = await supabase
      .from('profiles')
      .update({ profile_picture_url: filePath })
      .eq('id', userId)

    if (dbError) throw dbError

    return filePath
  }
}
```

Storage rule: use `bucket/${userId}/...` paths consistently for ownership; bucket RLS remains the enforcement boundary. Private bucket files should store paths in database rows; signed URLs can be generated at read time when needed.

---

## 10. React Query Architecture

All API communications and asynchronous state management are driven by TanStack Query.

### 10.1 Global Query Key Factory (`src/lib/api/query-keys.ts`)
```typescript
export const queryKeys = {
  attendance: {
    all: ['attendance'] as const,
    byEmployee: (id: string) => [...queryKeys.attendance.all, 'employee', id] as const,
    byDate: (date: string) => [...queryKeys.attendance.all, 'date', date] as const,
  },
  leave: {
    all: ['leave'] as const,
    byEmployee: (id: string) => [...queryKeys.leave.all, 'employee', id] as const,
    pending: () => [...queryKeys.leave.all, 'pending'] as const,
  },
  employee: {
    all: ['employees'] as const,
    detail: (id: string) => [...queryKeys.employee.all, 'detail', id] as const,
  }
}
```

### 10.2 Cache Configuration Invariant
- **staleTime:** Default to 10 minutes (`1000 * 60 * 10`) for query logs to avoid network overhead.
- **gcTime:** Default to 24 hours for local cache storage persistence.
- **Prefetching:** Trigger query client prefetch on `onMouseEnter` events on table rows and sidebar navigation items.

---

## 11. Form System

We use Zod schemas paired with React Hook Form for type-safe validations and layouts.

### 11.1 Reusable Form Primitives
- **Zod Schema:** Must validate input patterns (e.g. employee code regex `/^EMP-\d+$/i`).
- **Submit States:** Submit buttons must display a spinner overlay (`isLoading: true`) and transition to `disabled` during submission execution.
- **File Upload Fields:** Client checks file types (PDF/JPG/PNG/DOCX) and file size (<10MB) before initiating direct Supabase storage uploads.

---

## 12. Design System Engineering

We build responsive UI elements directly with Tailwind classes and CSS custom properties.

- **Button API:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}
```
- **Modal / Drawer API:** Focus-trapped container locking focus to the viewport. Esc key binds trigger the `onClose` callback.
- **Visual Badges:** Standardized styles for approvals and attendance states (`bg-emerald-50 text-accent-emerald` for active, `bg-rose-50 text-accent-rose` for inactive).

---

## 13. Folder Ownership

| Folder Path | Owner / Approver | Who May Modify | Who May Import |
| --- | --- | --- | --- |
| `src/shared/ui/` | Design System Dev | Core Engineers | All files (App, Features) |
| `src/features/attendance/` | Employee Dev | Core Engineers | App Layer (employee views) |
| `src/features/leave/` | Employee Dev | Core Engineers | App Layer (employee views) |
| `src/features/payroll/` | Payroll Dev | Core Engineers | App Layer (admin views) |
| `src/features/profile/` | Core Dev | Core Engineers | App Layer |
| `src/features/notifications/` | Core Dev | Core Engineers | App Layer |
| `src/features/audit/` | Admin Dev | Core Engineers | App Layer |
| `src/lib/supabase/` | Integration Dev | Integration Engineers | Services, Repositories |
| `src/app/` | Principal Architect | All team members | None (Entry Point) |

---

## 14. Coding Standards

### 14.1 Forbidden Coding Patterns
1. **No Inline Queries in Client UI:** Client Components must not define Supabase queries directly. Use repositories/hooks for client-side reads and mutations; RSC pages may perform initial Supabase reads.
2. **No useEffect Data Fetching:** Never fetch data inside component `useEffect` blocks. Use RSCs or TanStack Query.
3. **No Anonymous Default Exports:** Always export components as named default exports.
4. **No Type Assertions (`as any`):** Use strict TypeScript contracts.
5. **No Duplicated Query Keys:** Query keys must be resolved using the central `queryKeys` factory.
6. **No API logic inside UI:** Visual layers must only display styles and bind triggers.

---

## 15. Error Handling Architecture

- **PostgREST Errors:** The Supabase repository checks `error` objects returned from calls, mapping Postgres codes to human-readable strings.
- **Visual Boundaries:** Place custom Next.js `error.tsx` handlers within route groups to catch uncaught layout errors.
- **Global Toast Handler:** Capture mutations errors via the React Query mutation `onError` block and trigger a toast display.

---

## 16. Performance Architecture

- **Bundle Target:** The initial JavaScript bundle budget per page is **150KB gzipped**.
- **Virtualization:** Dynamic directories with >200 elements must use virtualization (`react-window`) to reduce rendering times.
- **Dynamic Imports:** Modal and drawer overlays must use dynamic loading (`next/dynamic`) with `ssr: false`.

---

## 17. Security Architecture

- **Auth Session Cookies:** Handled at the Edge boundary using `@supabase/ssr` cookies. Access tokens are not exposed to local browser JavaScript memory.
- **Database RLS:** Every database table must have Row-Level Security active, with policies checked against `auth.uid()`.
- **Upload Policies:** Users may only write files to Storage folders prefixed with their own user IDs (`bucket/${auth.uid()}/`).

---

## 18. Testing Architecture

- **Unit Tests:** Run via Vitest. All database operations and API calls are mocked using **Mock Service Worker (MSW)**.
- **End-to-End (E2E) Tests:** Run via Playwright. Validates sign-in, activation links, attendance button clicks, and settings drawer views.
- **Command Guidelines:**
  - Unit tests: `npm run test:unit`
  - Integration: `npm run test:integration`
  - E2E tests: `npx playwright test`

---

## 19. Team Engineering Workflow (Hackathon Setup)

- **Team Layout (4 Developers):**
  - **Dev 1 (UI & Layouts):** Shared primitives, visual components, CSS configurations.
  - **Dev 2 (Employee Features):** Dashboard logic, check-in widgets, attendance logs.
  - **Dev 3 (Admin Panel):** Search directory grids, details, leave approval tables.
  - **Dev 4 (Core Integration):** Supabase settings, middleware auth cookie managers, Edge function calls.
- **PR Merge Rules:** Branches must merge into `main` only after unit test runs pass.

---

## 20. Architecture Decision Records (ADRs)

### ADR 01: Next.js 15 App Router & RSC
- *Status:* Accepted
- *Context:* Build a lightweight, high-performance portal.
- *Decision:* Utilize RSC for data loading to minimize Javascript shipping overhead.

### ADR 02: Supabase direct RLS queries and Edge Functions
- *Status:* Accepted
- *Context:* The custom Go backend is deprecated.
- *Decision:* Utilize direct PostgREST RLS calls for CRUD operations. Use Supabase Edge Functions strictly for admin features (invites, terminations) requiring elevated privileges.

---

## 21. Future Scalability

The current feature-first foldering and repository boundaries are sufficient for the MVP.
