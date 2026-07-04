# Spec: WorkSync-HRMS Frontend

## Objective

Build a modern, high-performance, and responsive frontend for the WorkSync-HRMS system using **Next.js App Router**, **Tailwind CSS**, and **TanStack Query** (React Query). The application connects directly to Supabase via the Supabase JS SDK (utilizing PostgREST and Realtime subscriptions), enforcing database-level Row-Level Security (RLS) while providing a premium, fluid user experience.

### Target Audience
- **Employees:** Standard staff looking to check-in/out, request leaves, view calendars, upload documents, and view payroll.
- **Admins/HR managers:** Power users managing employee directories, reviewing leave requests, managing payroll setup, and reading audit logs.

### Core Goals (Lighter & Faster)
1. **Lightweight footprint:** Minimize the size of the JavaScript bundle shipped to the client by maximizing **React Server Components (RSC)** for read-heavy and static layouts, and limiting `'use client'` to interactive leaves.
2. **Speed:** Under 1.5 seconds for first contentful paint (FCP) and interactive loads. No bloated UI component libraries (like material-ui); instead, use highly optimized Tailwind utility classes and native HTML elements styled with custom properties.
3. **Security:** Zero client-side logic for authorization boundaries. Route guards exist solely for navigation/UX, while database RLS acts as the absolute barrier.

---

## 1. Visual Design Tokens & Aesthetics

To move away from the generic "AI default aesthetic" (purple/indigo gradient overload), we use a structured, high-contrast, professional palette with soft transitions and glassmorphism accents.

### 1.1 Color System (HSL)

We establish CSS variables for light and dark modes to facilitate automatic theme matching and high contrast compliance.

```css
:root {
  /* Light Mode Palette */
  --background: 210 40% 98%;     /* Light gray-blue */
  --surface: 0 0% 100%;          /* Pure White */
  --surface-border: 214 32% 91%; /* Soft border */
  
  --primary: 222 47% 11%;        /* Slate-900 (Text & Dark Accents) */
  --primary-hover: 215 25% 27%;
  --primary-foreground: 210 40% 98%;

  --accent-blue: 217 91% 60%;    /* Ocean Blue (Actions/Info) */
  --accent-emerald: 160 84% 39%; /* Emerald (Success/Checked-in) */
  --accent-rose: 343 81% 59%;    /* Rose (Danger/Absent/Rejected) */
  --accent-amber: 38 92% 50%;    /* Amber (Warning/Pending) */

  --text-main: 215 25% 12%;      /* Slate-800 */
  --text-muted: 215 16% 47%;     /* Slate-500 */
}

.dark {
  /* Dark Mode Palette */
  --background: 222 47% 6%;      /* Slate-950 */
  --surface: 222 47% 11%;        /* Slate-900 */
  --surface-border: 217 33% 17%;  /* Slate-800 */

  --primary: 210 40% 98%;        /* White/Slate-50 */
  --primary-hover: 215 20% 85%;
  --primary-foreground: 222 47% 11%;

  --text-main: 210 40% 98%;      /* Slate-50 */
  --text-muted: 215 20% 65%;     /* Slate-400 */
}
```

### 1.2 Typography Hierarchy

We use Google Fonts: **Outfit** for headings (modern, geometric) and **Inter** for body copy (clean, highly readable).

- **Page Title (`h1`):** `font-family: Outfit`, `font-size: 1.875rem (30px)`, `font-weight: 700`, `letter-spacing: -0.025em`.
- **Section Heading (`h2`):** `font-family: Outfit`, `font-size: 1.25rem (20px)`, `font-weight: 600`.
- **Subsection Heading (`h3`):** `font-family: Outfit`, `font-size: 1rem (16px)`, `font-weight: 600`.
- **Body Text (`body`):** `font-family: Inter`, `font-size: 0.875rem (14px)`, `line-height: 1.5`, `font-weight: 400`.
- **Captions & Metadata (`small`):** `font-family: Inter`, `font-size: 0.75rem (12px)`, `font-weight: 500`.

### 1.3 Spacing & Grid System

All layouts must align to an **8px (0.5rem) grid scale** to maintain vertical rhythm.
- Padding/Margin increments: `4px (0.25rem)`, `8px (0.5rem)`, `12px (0.75rem)`, `16px (1rem)`, `24px (1.5rem)`, `32px (2rem)`, `48px (3rem)`.
- Cards: Padding must be exactly `24px (1.5rem)` on desktop, and `16px (1rem)` on mobile devices.
- Grid Gap: Standard dashboard grid uses `24px (1.5rem)` gaps.

### 1.4 Glassmorphism & Depth (Lightweight)

To avoid heavy CSS rendering bottlenecks:
- Apply shadows sparingly. Use `box-shadow: 0 1px 3px 0 rgba(0,0,0,0.05)` for cards.
- Glassmorphism only for the sidebar/navbar backdrop blur:
  `background: hsla(var(--surface) / 0.8)`, `backdrop-filter: blur(12px)`.

### 1.5 Micro-Animations & Transitions

We use pure CSS transitions or lightweight Framer Motion (`framer-motion/dom` or minimal feature pack) to keep bundle sizes small.
- **Button Hover/Focus:** `transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`. Slight scale-up (`scale: 1.01`) and background tint change.
- **Page Transitions:** Pure layout fades via Next.js templates.
- **Checkbox/Switch toggles:** Slide transitions over `150ms`.

---

### 1.6 Reusable UI Component Library

To prevent style fragmentation and bloated bundles, the frontend relies on these primitive components styled directly with Tailwind utility classes.

#### 1.6.1 Button Component (`src/components/ui/Button.tsx`)
- **Props:**
  - `variant`: `'primary' | 'secondary' | 'danger' | 'ghost'`
  - `size`: `'sm' | 'md' | 'lg'`
  - `isLoading`: `boolean`
  - `isDisabled`: `boolean`
  - `children`: `React.ReactNode`
- **Tailwind Mapping:**
  - Base: `inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue disabled:opacity-50 disabled:cursor-not-allowed`
  - Sizes:
    - `sm`: `px-3 py-1.5 text-xs`
    - `md`: `px-4 py-2.5 text-sm`
    - `lg`: `px-6 py-3.5 text-base`
  - Variants:
    - `primary`: `bg-primary text-primary-foreground hover:bg-primary-hover`
    - `secondary`: `border border-surface-border text-text-main bg-surface hover:bg-slate-50 dark:hover:bg-slate-800`
    - `danger`: `bg-accent-rose text-white hover:bg-rose-600`
    - `ghost`: `text-text-muted hover:text-text-main hover:bg-slate-100 dark:hover:bg-slate-800`

#### 1.6.2 Form Control: Input, Textarea, Select
- **Props:**
  - `label`: `string`
  - `error`: `string`
  - `icon`: `React.ReactNode` (Optional prefix icon)
- **Tailwind Mapping:**
  - Field: `w-full px-3.5 py-2.5 rounded-lg border border-surface-border bg-surface text-text-main placeholder-text-muted transition-all outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent`
  - Error State: `border-accent-rose focus:ring-accent-rose focus:border-accent-rose`
  - Label: `block text-xs font-semibold text-text-muted mb-2 tracking-wide uppercase`
  - Error Text: `block text-xs font-medium text-accent-rose mt-1.5`

#### 1.6.3 Badge Component (`src/components/ui/Badge.tsx`)
- **Props:**
  - `variant`: `'success' | 'warning' | 'danger' | 'info'`
  - `children`: `string`
- **Tailwind Mapping:**
  - Base: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border`
  - Colors:
    - `success`: `bg-emerald-50 text-accent-emerald border-emerald-200 dark:bg-emerald-950/20`
    - `warning`: `bg-amber-50 text-accent-amber border-amber-200 dark:bg-amber-950/20`
    - `danger`: `bg-rose-50 text-accent-rose border-rose-200 dark:bg-rose-950/20`
    - `info`: `bg-blue-50 text-accent-blue border-blue-200 dark:bg-blue-950/20`

#### 1.6.4 Table Components (`src/components/ui/Table.tsx`)
- **Structure:** `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`
- **Tailwind Mapping:**
  - Table wrapper: `w-full border-collapse text-left border border-surface-border rounded-lg overflow-hidden bg-surface`
  - `th`: `px-4 py-3 text-xs font-bold text-text-muted border-b border-surface-border bg-slate-50/50 uppercase tracking-wider`
  - `td`: `px-4 py-3.5 text-sm text-text-main border-b border-surface-border`
  - `tr`: `hover:bg-slate-50/50 transition-colors`

#### 1.6.5 Modal / Overlay Dialog (`src/components/ui/Modal.tsx`)
- **Props:**
  - `isOpen`: `boolean`
  - `onClose`: `() => void`
  - `title`: `string`
  - `children`: `React.ReactNode`
- **Structure:**
  - Backdrop: `fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4` (click backdrop triggers `onClose`)
  - Content Box: `bg-surface border border-surface-border rounded-xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200`

#### 1.6.6 Toast Notification Banner (`src/components/ui/Toast.tsx`)
- **Props:**
  - `message`: `string`
  - `type`: `'success' | 'error' | 'info'`
- **Tailwind Mapping:**
  - Banner: `fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3.5 rounded-lg shadow-lg border bg-surface text-text-main animate-in slide-in-from-top-4 duration-300`
  - Border/Icon: Green/Emerald for success, Rose for error, Blue for info.

---

## 2. Project Routing & Layout Architecture

The directory structure mirrors route grouping and maps directly to the role-based permission boundaries.

### 2.1 File Tree (`src/app/`)

```
src/
├── app/
│   ├── layout.tsx                # Global HTML structure, font loads, theme provider
│   ├── page.tsx                  # Landing page redirect (to dashboard or login)
│   ├── middleware.ts             # Route guard middleware (executes on Edge runtime using @supabase/ssr)
│   │
│   ├── (auth)/                   # Auth Segment
│   │   ├── layout.tsx            # Simple centered card layout
│   │   ├── login/
│   │   │   └── page.tsx          # Sign-in form (Email + Password)
│   │   ├── activate/
│   │   │   └── page.tsx          # Invite activation screen (Password setup for invited employees)
│   │   └── reset-password/
│   │       └── page.tsx          # Password recovery/reset form
│   │
│   ├── (employee)/               # Employee Interface (Authenticated)
│   │   ├── layout.tsx            # Base dashboard layout with Employee Sidebar & Header
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Real-time dashboard (Check-in state, recent feed, summary)
│   │   ├── profile/
│   │   │   └── page.tsx          # Profile details, picture & document manager
│   │   ├── attendance/
│   │   │   └── page.tsx          # Monthly attendance calendar
│   │   └── leave/
│   │       └── page.tsx          # Leave request log & request creation drawer
│   │
│   └── (admin)/                  # Admin / HR Interface (Authenticated & Admin Role)
│       ├── layout.tsx            # Base dashboard layout with Admin Sidebar & Header
│       ├── dashboard/
│       │   └── page.tsx          # Aggregated real-time metrics & charts
│       ├── employees/
│       │   ├── page.tsx          # Employee searchable directory grid
│       │   └── [id]/
│       │       └── page.tsx      # Admin view of employee profile, attendance, and payroll config
│       ├── leave-approvals/
│       │   └── page.tsx          # Pending approvals table with quick actions
│       ├── payroll/              # [OPTIONAL / Future Enhancement]
│       │   └── page.tsx          # Reserved for future payroll generator runs (out of scope for v1.0)
│       └── audit/
│           └── page.tsx          # Append-only audit logs table
```

### 2.2 Navigation Layouts (Desktop vs Mobile)

#### 2.2.1 Sidebar Navigation (Desktop - Width: 260px)
- Fixed to left, full height (`h-screen`).
- Background: `hsla(var(--surface) / 0.8)` with backdrop blur and border-right.
- Top section: App Logo (`WorkSync` with an emerald pulse indicator dot).
- Middle section: Vertical link list with icons (Lucide icons). Active link uses primary color with light emerald background indicator.
- Bottom section: User Profile badge showing name, role badge, and a **Sign Out** button.

#### 2.2.2 Mobile Navigation (Width: 100%)
- **Top Bar:** Fixed header (`bg-surface/80 border-b border-surface-border backdrop-blur-md`). Left side: App Logo. Right side: Profile avatar trigger (opens quick profile/logout menu).
- **Mobile Bottom Navigation Bar:** Fixed to viewport bottom (`h-16 bg-surface/90 border-t border-surface-border backdrop-blur-md flex items-center justify-around z-40`).
  - Contains 5 equally spaced, large touch-target buttons with labels and vertical icons (`w-14 h-12 flex flex-col items-center justify-center gap-1`):
    1. **Dashboard:** Redirects to `/dashboard`.
    2. **Attendance:** Redirects to `/attendance`.
    3. **Leave:** Redirects to `/leave`.
    4. **Notifications:** Small bell icon with absolute-positioned red count badge. Opens notification sheet.
    5. **Profile:** Redirects to `/profile`.

### 2.3 Middleware Role Guards (`middleware.ts`)

To prevent unauthorized UI routing, the middleware intercepts requests and checks the authenticated session. User roles are dynamically queried from the database `profiles` table to prevent JWT client-side cache and synchronization issues.

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Initialize Supabase Server Client (modern @supabase/ssr approach)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set({ name, value, ...options })
          )
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set({ name, value, ...options })
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 1. Redirect unauthenticated users to /login
  if (!user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/activate')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    // 2. Query user role from database (profiles table) to prevent JWT stale metadata issues
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'employee'

    // 3. Prevent non-admins from entering /admin/* routes
    if (request.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 4. Prevent logged-in users from seeing /login and /activate
    if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/activate')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
```

---

## 3. Detailed Employee Views Specification

### 3.1 Authentication & Onboarding Segment `(auth)/`

All authentication pages share a centered glassmorphic card container (`max-w-md w-full p-8 bg-surface border border-surface-border rounded-xl shadow-lg`). WorkSync-HRMS does not support public sign-up registration. Instead, it uses an administrative invite onboarding workflow.

#### 3.1.1 Onboarding Workflow (Invite Activation)
1. **Invite Generation:** An admin creates the employee profile via Edge Function `/invite-employee`.
2. **Activation Link:** Supabase Auth triggers an invite email containing a token hash redirecting to:
   `https://worksync.com/api/auth/callback?token_hash=...&type=invite&next=/activate`
3. **Session Set:** The Next.js callback route handler processes the hash, sets the session cookies, and redirects the employee to `/activate`.

#### 3.1.2 Invite Activation Screen (`/activate`)
- **UI Structure:** Centered box with input fields for:
  - **New Password:** Label on top, input (`type="password"`, `required`, descriptive ID `activate-password`). Must satisfy security standards (min 8 chars, 1 number, 1 special char).
  - **Confirm Password:** Input (`type="password"`, `required`, descriptive ID `activate-confirm-password`).
- **Submit Button:** Full-width primary button. Text: **"Activate Account"**.
- **Action:** Calls the Supabase JS client SDK method: `supabase.auth.updateUser({ password })` directly on the client, establishes the new password, and redirects the user to `/dashboard`.

#### 3.1.3 Sign In Screen (`/login`)
- **Logo:** Application logo centered at the top (`mb-6`).
- **Form Fields:**
  - **Email Address:** Label on top, input (`type="email"`, `required`, descriptive ID `login-email`). Focus state shows a thin `--accent-blue` outline.
  - **Password:** Label on top with a right-aligned "Forgot Password?" link. Input (`type="password"`, `required`, descriptive ID `login-password`).
- **Submit Button:** Full-width primary button. Centered text: **"Sign In"**.
- **Action:** Calls the Supabase SDK method: `supabase.auth.signInWithPassword({ email, password })`.

---

### 3.2 Employee Dashboard (`(employee)/dashboard`)

A responsive layout that rearranges to 1-column on mobile (<768px) and 3-columns on desktop.

```
┌────────────────────────────────────────────────────────┐
│  Welcome, John Doe                                     │
│  Subtext: Saturday, July 4, 2026      [ 11:45:02 AM ]  │
├────────────────────────────────────────────────────────┤
│ ┌──────────────────────┐ ┌───────────────────────────┐ │
│ │                      │ │   TODAY'S STATUS          │ │
│ │   [ CHECK IN/OUT ]   │ │   Checked in: 09:12 AM    │ │
│ │   Pulse: Active/Idle │ │   Duration: 2h 33m        │ │
│ │                      │ └───────────────────────────┘ │
│ └──────────────────────┘ ┌───────────────────────────┐ │
│                          │   LEAVE DAYS TAKEN        │ │
│                          │   4 Days Approved         │ │
│                          └───────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

#### 3.2.1 Check-In / Check-Out Widget
- **Position:** Top left card on desktop, top-most card on mobile.
- **Visuals:** A card with HSL surface background. A large circular button centered inside the card.
  - **Inactive state (Checked Out):** Circular button is `--accent-blue` background. Prominent text inside reads **"Check In"**. Pulse indicator is solid gray.
  - **Active state (Checked In):** Circular button is `--accent-rose` background. Prominent text inside reads **"Check Out"**. Pulse indicator flashes `--accent-emerald`.
- **Clock Widget:** Real-time digital clock displaying hours, minutes, and seconds running inside the widget (`font-mono`, centered above the button).
- **Sub-info:** Below the button, text showing either "Not checked in today" or "Checked in at 09:15 AM".
- **Mutation Action:**
  - Clicking "Check In" inserts a row in the `attendance` table using the Supabase client:
    ```typescript
    await supabase.from('attendance').insert({
      employee_id: userId,
      work_date: new Date().toISOString().split('T')[0],
      check_in: new Date().toISOString(),
      status: 'present',
      org_id: orgId
    })
    ```
  - Clicking "Check Out" updates the active check-in row using the Supabase client:
    ```typescript
    await supabase.from('attendance').update({
      check_out: new Date().toISOString()
    }).eq('id', todayAttendanceId)
    ```
  - Both queries use TanStack Query mutations that invalidate query keys `['attendance']` and `['dashboard-stats']` upon resolution.

#### 3.2.2 Live status cards (3-Column Grid)
1. **Today's Summary Card:** Displays current state. If checked in, shows a timer of elapsed hours (`duration: current_time - check_in_time`).
2. **Leave Days Taken Card:** Displays the count of approved leave days taken for the current year. Sourced from Supabase direct RLS query: `supabase.from('leave_requests').select('*').eq('employee_id', userId).eq('status', 'approved')`.
3. **Payroll Config Summary Card:** Displays active payroll compensation details. Sourced from `payroll` table via RLS query: `supabase.from('payroll').select('*').eq('employee_id', userId).single()`.

---

### 3.3 Profile Manager (`(employee)/profile`)

Split-screen layout on desktop: Left panel (Avatar/files), Right panel (Personal details form).

#### 3.3.1 Avatar Upload
- **Position:** Left panel top.
- **UI:** A circular skeleton (`w-32 h-32 rounded-full border-2 border-surface-border bg-slate-100 flex items-center justify-center relative overflow-hidden group mx-auto`).
- **Interactivity:** Hovering over the image reveals a dark overlay with text "Change Photo" and a upload camera icon. Clicking triggers a hidden `<input type="file" accept="image/*">`.
- **Upload Action:** Triggers direct file upload to Supabase Storage `profile-pictures` bucket using key `profile_pictures/${userId}/avatar.png`. On success, the frontend updates the database row in the `profiles` table: `supabase.from('profiles').update({ avatar_url }).eq('id', userId)`.

#### 3.3.2 Document Upload & List
- **Position:** Left panel bottom.
- **UI:** Drag-and-drop dotted boundary area. Text inside: "Drag and drop or click to upload ID/Certificates (PDF, JPG, JPEG, PNG, DOCX up to 10MB)".
- **File List:** Below the drag area, a table displaying user documents:
  - Columns: File Type Icon, File Name, Upload Date, Action (Trash icon to Delete).
  - **Upload Action:** File is uploaded directly to the private Supabase storage bucket `documents` under key `documents/${userId}/${crypto.randomUUID()}-${file.name}`.
  - **Delete Action:** Calls the Supabase Storage client: `supabase.storage.from('documents').remove([filePath])` and refreshes the file list.

#### 3.3.3 Profile Form Details
- **Position:** Right panel.
- **Fields:**
  - **Full Name:** Read-only input field (`bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed`).
  - **Employee Code:** Read-only input field.
  - **Role / Job Title / Department / Join Date:** Read-only input fields grouped in a 2x2 grid.
  - **Mobile Phone:** Editable input (`type="tel"`, placeholder "+91 XXXXX XXXXX").
  - **Residential Address:** Editable textarea (`rows={3}`).
- **Form Actions (Footer):** Right-aligned button group: **"Save Changes"** (calls `supabase.from('profiles').update({ mobile_phone: phone, residential_address: address }).eq('id', userId)`) and **"Reset"** (restores initial values). Disabled if form is pristine.

---

### 3.4 Attendance Calendar (`(employee)/attendance`)

#### 3.4.1 Layout
- Top row: Current Month & Year title (e.g. "July 2026") centered. Left/Right Chevron buttons to navigate months.
- Calendar Grid: 7-column grid matching days of the week (`Sun`, `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`).

#### 3.4.2 Cell Design
- Height: Min `100px`. Border on all sides.
- Top Right: Date number (`1`, `2`, `3`...).
- Bottom Left: Small badge dot indicating status:
  - `--accent-emerald` for Present.
  - `--accent-rose` for Absent.
  - `--accent-amber` for Half-day or Approved Leave.
- **Tooltip Hover Box:** Hovering over a date card shows an absolute-positioned floating tooltip box (`z-50 bg-primary text-white p-3 rounded shadow-md text-xs`):
  - Check-in: `HH:MM:SS` or `N/A`.
  - Check-out: `HH:MM:SS` or `N/A`.
  - Status: Present / Absent / Sick Leave.
- Data is fetched via direct RLS queries on `attendance` for maximum speed, backed by a client-side state cache.

---

### 3.5 Leave Request Log & Sliding Drawer (`(employee)/leave`)

#### 3.5.1 Leave History Table
- Top Right: Button **"+ Request Leave"** (`bg-accent-blue hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2`).
- Table Columns:
  - **Type:** (Paid / Sick / Unpaid)
  - **Start Date / End Date:** Formatting `DD MMM YYYY`.
  - **Duration:** Total computed calendar days.
  - **Status:** Pill badges (`bg-amber-100 text-amber-800` for Pending, `bg-emerald-100 text-emerald-800` for Approved, `bg-rose-100 text-rose-800` for Rejected).
  - **Actions:** If Status is Pending, displays a **"Cancel"** link (calls `supabase.from('leave_requests').delete().eq('id', leaveId)`).

#### 3.5.2 Sliding Request Drawer
- **Visuals:** Slides from the right edge covering the right 420px. Backdrop blur overlay masks the main screen.
- **Form Fields:**
  - **Leave Type:** Dropdown select input (options: Paid, Sick, Unpaid).
  - **Start Date:** Date input (validated to be >= current date).
  - **End Date:** Date input (validated to be >= Start Date).
  - **Remarks:** Textarea (`max-length={250}`) for employee justification. Includes a live character counter.
- **Form Footer Actions:** Fixed at the bottom of the drawer.
  - **Submit Button:** Positioned bottom-right. Calls Supabase client:
    ```typescript
    await supabase.from('leave_requests').insert({
      employee_id: userId,
      leave_type: type,
      start_date: startDate,
      end_date: endDate,
      remarks: remarks,
      status: 'pending',
      org_id: orgId
    })
    ```
  - **Close/Cancel Button:** Positioned bottom-left.

---

## 4. Detailed Admin Views Specification

### 4.1 Admin Dashboard (`(admin)/dashboard`)

Grid layout matching a 4-column KPI section at the top, a main central panel for real-time tracking, and a sidebar for quick statistics.

#### 4.1.1 KPI Row (4-column grid on desktop, 2x2 on tablet, 1-column on mobile)
1. **Total Employees Card:** Shows active staff count. Sourced from Supabase RLS query: `supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'employee')`.
2. **Checked-In Today Card:** Shows current check-ins. Sourced from Supabase RLS query: `supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('work_date', todayStr)`.
3. **Pending Leaves Card:** Count of pending requests. Colored in `--accent-amber` if count > 0, otherwise neutral.
4. **Total Configured Payroll Liability Card:** Displays the sum of configured active base salary and allowance rates. Sourced from `payroll` table via RLS query.

#### 4.1.2 Real-time Activity Feed (`(admin)/dashboard` bottom-left)
- **UI:** Table or scroll list (`max-h-[450px] overflow-y-auto`).
- **Data Source:** Subscribed to Supabase Realtime channel for `attendance` and `leave_requests` state changes. Updates query cache key `['dashboard-stats']`.
- **Visuals:** Row cards with user thumbnails, activity message, and dynamic timestamp relative logger (e.g., "1m ago", "Just now").
  - Check-in activity shows a small green badge.
  - Leave submittal activity shows a small blue badge.

#### 4.1.3 Attendance Gauge Ring (`(admin)/dashboard` bottom-right)
- **UI:** A radial progress ring displaying checked-in vs absent employees.
- **Center Text:** Focuses on percentage (`82%`). Below the circle, a legend maps colors to state count (Present: 41, Absent: 5, On Leave: 4).

---

### 4.2 Employee Directory (`(admin)/employees`)

A comprehensive database management panel for staff profiles.

```
┌────────────────────────────────────────────────────────┐
│  Employee Directory                        [ + Invite ]│
├────────────────────────────────────────────────────────┤
│  [ Search... ] [ Dept: All v ] [ Role: All v ]         │
├────────────────────────────────────────────────────────┤
│  Photo  Code     Name       Job Title   Dept    Actions│
│  [img]  EMP-101  Jane Doe   HR Manager  HR    [View][X]│
└────────────────────────────────────────────────────────┘
```

#### 4.2.1 Search and Filter Header
- **Search Input:** Left-aligned. Text input with Magnifying glass icon (`placeholder="Search by name or code..."`, descriptive ID `employee-search`).
- **Department Dropdown:** Custom styled select input. Defaults to "All Departments". (Populated dynamically from active employee profile records).
- **Role Dropdown:** Select input. Defaults to "All Roles" (options: Admin, Employee).
- **Add Employee Button:** Positioned top-right (`bg-accent-blue text-white py-2 px-4 rounded-lg hover:bg-blue-600 font-semibold flex items-center gap-2`). Text: **"+ Invite Employee"**. Triggers a modal popup.

#### 4.2.2 Invite Employee Modal
- **Position:** Centers in viewport. Dimmed backdrop blur overlay.
- **Form Layout:** 2-column input grid.
  - Column 1: Full Name, Email, Employee Code (pattern `/^EMP-\d+$/i`), Job Title.
  - Column 2: Department, Role select, Mobile Phone, Date Joined.
- **Modal Footer Actions:**
  - **"Cancel" Button:** Bottom-left. Close trigger.
  - **"Send Invite" Button:** Bottom-right. Calls Supabase Edge Function `/functions/v1/invite-employee` (which creates the profile record, triggers a Supabase auth invite email, and invalidates query cache `['employees']`).

#### 4.2.3 Directory Table Grid
- Desktop standard table.
- Columns: Avatar image, Employee Code, Full Name, Job Title, Department, Role badge, Date Joined, Actions.
- **Action Buttons:**
  - **Edit Details Button:** Link styled with a grey border. Redirects to `/admin/employees/[id]`.
  - **Terminate Button:** Button styled with a red border. Triggers custom validation modal to confirm termination. Clicking "Confirm" calls Supabase Edge Function `/functions/v1/terminate-employee` (to revoke auth login rights and mark the profile status).

---

### 4.3 Employee Detail & Payroll Config (`(admin)/employees/[id]`)

A single-employee administrative dashboard using top horizontal tabs.
- **Tab Header:** Horizontal navigation bar below employee core name badge:
  1. Profile Details
  2. Attendance log
  3. Payroll Configuration

#### 4.3.1 Profile Details Tab
- Admin-editable version of the profile form. All fields (Full name, job title, department, etc.) are enabled. A **"Save Profile"** button at the bottom-right calls `supabase.from('profiles').update({ ... }).eq('id', id)`.

#### 4.3.2 Attendance Log Tab
- Displays list of employee's check-ins filtered by month. Admin has a **"Manual Correction"** button to modify check-in/out timestamps. Clicking "Save Correction" calls `supabase.from('attendance').upsert({ id, check_in, check_out, ... })` or `update(...)`.

#### 4.3.3 Payroll Configuration Tab
- **Objective:** Configure compensation components for this individual.
- **Form Fields:**
  - **Base Salary:** Decimal input (`type="number"`, ID `payroll-base-salary`).
  - **Allowances:** Decimal input.
  - **Deductions:** Decimal input.
  - **Effective Date:** Date picker.
- **Primary Button:** **"Save & Update Payroll"** (`bg-primary text-primary-foreground py-2 px-6 rounded-lg font-semibold hover:bg-primary-hover`).
- **Action Integration:** Clicking calls the Supabase client: `supabase.from('payroll').upsert({ employee_id, base_salary, allowances, deductions, effective_from }).eq('employee_id', employeeId)`.

---

### 4.4 Leave Approvals (`(admin)/leave-approvals`)

The inbox for administrative reviews.

#### 4.4.1 Pending Approvals Queue
- Table layout displaying all requests where `status = 'pending'`.
- Columns: Employee details, Leave Type, Date Range, Duration, Remarks (reason), Actions.
- **Quick-Action Buttons:**
  - **Approve Button:** Text "Approve" with a Check icon. Directly calls Supabase client: `supabase.from('leave_requests').update({ status: 'approved' }).eq('id', leaveId)`.
  - **Reject Button:** Text "Reject" with X icon. Triggers Rejection Comments Modal.

#### 4.4.2 Rejection comments Modal
- Centered overlay.
- Textarea input for `Rejection Comment` (Required, minimum 10 characters).
- Footer Actions:
  - **Confirm Rejection Button:** Highlighted in Rose. Disabled if comment length is <10 characters. Calls Supabase client: `supabase.from('leave_requests').update({ status: 'rejected', reviewer_comment }).eq('id', leaveId)`.
  - **Cancel Button:** Closes modal.

---

### 4.5 [OPTIONAL / Future Enhancement - Out of Scope for v1.0] Payroll Generation Panel (`(admin)/payroll`)

> [!NOTE]
> Monthly payroll run processing, payout workflows, and tax computations are explicitly **out of scope for v1.0** (PRD §2.2 / Backend Spec Decision 5). In v1.0, compensation is configured exclusively per-individual under the employee details configuration view (`/admin/employees/[id]`).

```
┌────────────────────────────────────────────────────────┐
│  Payroll Dashboard                     [ Run Payroll ] │
├────────────────────────────────────────────────────────┤
│  Month: July 2026 v                                    │
├────────────────────────────────────────────────────────┤
│  Code     Name        Salary    Deductions  Net   State│
│  EMP-101  Jane Doe    75,000    2,500       72,500 [Pd]│
└────────────────────────────────────────────────────────┘
```

#### 4.5.1 Control Action Bar
- **Month/Year Selector:** Dropdown selector. Defaults to active month.
- **Run Monthly Payroll Button:** Prominent right-aligned primary button (`bg-accent-emerald text-white py-2 px-5 rounded-lg hover:bg-emerald-600 font-semibold`). Triggers a double-confirm modal to verify run. Calls Supabase Edge Function `/functions/v1/payroll-generate` (passing target month and year).

#### 4.5.2 Payroll Table
- Columns: Employee Code, Name, Base Salary, Allowances, Deductions, Computed Tax, Net Salary, Status Badge.
  - Status Badge: `bg-amber-100` for Unpaid, `bg-emerald-100` for Paid.
- **Action Button:**
  - If Unpaid, shows **"Process Payout"** button. Triggers mutation calling Supabase Edge Function `/functions/v1/payroll-payout` passing payout ID.

---

### 4.6 Audit Logs Viewer (`(admin)/audit`)

Append-only table displaying the immutable system activity history.

#### 4.6.1 Layout & Grid
- Standard table layout with horizontal scrolling support for small screens.
- Columns:
  - **Timestamp:** Formatted as `YYYY-MM-DD HH:MM:SS` (using fixed width, mono font).
  - **Actor:** Employee Full Name (hyperlink to employee details).
  - **Action Type:** Color coded pills (e.g. `leave.approved` in emerald, `payroll.updated` in amber, `auth.register` in blue).
  - **Target Entity:** Display target table and row ID.
  - **Metadata:** Expanded JSON tree viewer widget (using a collapsible toggle arrow to preview details).
- **Pagination Footer:** Bottom right controls showing `Page X of Y` with `<` and `>` Chevrons. Pagination is handled server-side using PostgREST limits and range headers (read direct from Supabase with RLS filters).

---

## 5. State Management & API Integration

### 5.1 Supabase Client & Auth Helper (`src/lib/supabase/client.ts`)

We connect Next.js App Router to Supabase using a client-side singleton client powered by `@supabase/ssr` to manage authentication states and cookies.

```typescript
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

export const supabase = createClient()
```

### 5.2 Supabase Edge Functions HTTP Client (`src/lib/supabase/functions.ts`)

For administrative operations that run under elevated privileges (e.g., inviting or terminating employees), the frontend calls Supabase Edge Functions.

```typescript
import { supabase } from '@/lib/supabase/client'

export async function invokeFunction<T>(functionName: string, body?: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body,
  })

  if (error) {
    throw new Error(error.message || `Edge function error: ${functionName}`)
  }

  return data as T
}
```

### 5.3 Server State Cache & Caching Strategy (TanStack Query)

To optimize network payloads and improve application perceived speed, the client utilizes `@tanstack/react-query` to govern query caches.

#### 5.3.1 Query Prefetching
Hovering over sidebar links or directory pagination targets pre-warms the cache using Next.js route prefetching combined with React Query prefetching:

```typescript
const prefetchEmployees = async (page: number) => {
  await queryClient.prefetchQuery({
    queryKey: ['employees', page],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .range(page * 10, (page + 1) * 10 - 1)
      if (error) throw error
      return data
    },
    staleTime: 60 * 1000 // 1 minute stale buffer
  })
}
```

#### 5.3.2 Optimistic Cache Updates
For highly frequent micro-interactions (e.g. check-in/out widgets), the client renders updates instantly, reverting context cache state only upon failure:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

export function useCheckIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { employee_id: string; work_date: string; check_in: string; status: string; org_id: string }) => {
      const { data, error } = await supabase
        .from('attendance')
        .insert(payload)
        .select()
        .single()
      if (error) throw error
      return data
    },
    
    onMutate: async () => {
      // 1. Cancel outgoing refetches to prevent overwrites
      await queryClient.cancelQueries({ queryKey: ['attendance'] })
      // 2. Snapshot current cache
      const previousAttendance = queryClient.getQueryData(['attendance'])
      // 3. Optimistically write checked-in state
      queryClient.setQueryData(['attendance'], (old: any) => ({
        ...old,
        checkedIn: true,
        checkInTime: new Date().toISOString()
      }))
      return { previousAttendance }
    },
    onError: (err, variables, context) => {
      // Rollback cache if mutation rejects
      if (context) {
        queryClient.setQueryData(['attendance'], context.previousAttendance)
      }
    },
    onSettled: () => {
      // Invalidate and sync with server
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
    }
  })
}
```

### 5.4 Supabase Storage Upload Flow
- Upload requests are triggered on the client using the browser SDK client, uploading files directly to Supabase storage to bypass proxy memory bottlenecks.
- Verification rules (max size 10MB, PDF/images/DOCX formats only) are validated in JS before starting upload.
- File uploads are placed directly under private storage bucket folder paths: `documents/${userId}/${crypto.randomUUID()}-${file.name}`.

### 5.5 Realtime Activity Subscriptions
The admin activity logs feed and employee notification center listen to Supabase Realtime logical replication events, automatically triggering key invalidations on active queries.

### 5.6 Form Validation Standard (Zod + React Hook Form)

Every interactive user submission form must possess strict validation rules mapped via a **Zod** schema resolver.

#### 5.6.1 Validation Code Blueprint (e.g., Leave Request Form)
```typescript
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Define the validation contract
export const LeaveRequestSchema = z.object({
  leave_type: z.enum(['paid', 'sick', 'unpaid'], {
    required_error: 'Please select a leave type'
  }),
  start_date: z.string().refine((date) => new Date(date) >= new Date(new Date().setHours(0,0,0,0)), {
    message: 'Start date must be today or in the future'
  }),
  end_date: z.string(),
  remarks: z.string()
    .min(1, 'Remarks/Reason is required')
    .max(250, 'Remarks cannot exceed 250 characters')
}).refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
  message: 'End date must be on or after the start date',
  path: ['end_date']
})

type LeaveRequestInput = z.infer<typeof LeaveRequestSchema>

export function LeaveRequestForm({ onSubmit }: { onSubmit: (data: LeaveRequestInput) => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LeaveRequestInput>({
    resolver: zodResolver(LeaveRequestSchema)
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Leave Type</label>
        <select {...register('leave_type')} className="select">
          <option value="paid">Paid Leave</option>
          <option value="sick">Sick Leave</option>
          <option value="unpaid">Unpaid Leave</option>
        </select>
        {errors.leave_type && <p className="error-text">{errors.leave_type.message}</p>}
      </div>

      <div>
        <label className="label">Start Date</label>
        <input type="date" {...register('start_date')} className="input" />
        {errors.start_date && <p className="error-text">{errors.start_date.message}</p>}
      </div>

      <div>
        <label className="label">End Date</label>
        <input type="date" {...register('end_date')} className="input" />
        {errors.end_date && <p className="error-text">{errors.end_date.message}</p>}
      </div>

      <div>
        <label className="label">Remarks</label>
        <textarea {...register('remarks')} className="textarea" placeholder="Provide reason..." />
        {errors.remarks && <p className="error-text">{errors.remarks.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  )
}
```

### 5.7 Offline Caching & Local Storage Persistence

To satisfy local/offline functionality, TanStack Query is configured with local storage persistence to serve cached data when internet connection is lost.

#### 5.7.1 Persistence Configuration (`src/lib/providers/QueryProvider.tsx`)
```typescript
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // Keep garbage collection cache for 24 hours
      staleTime: 1000 * 60 * 10,  // Data remains fresh for 10 minutes locally
      networkMode: 'offlineFirst', // Serve cache first, fetch in background if online
    },
  },
})

const persister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
})

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      {children}
    </PersistQueryClientProvider>
  )
}
```

#### 5.7.2 Offline Indicator Warning Layout
When `navigator.onLine === false`, the layout renders a fixed banner warning at the top of the screen:
- **Style:** `h-8 w-full bg-accent-amber text-slate-900 text-center py-1.5 text-xs font-semibold tracking-wide z-[9999] fixed top-0`
- **Text:** "Working offline. You are viewing cached information. Actions requiring server connection are temporarily disabled."
- **Behavior:** Slide transition from the top, disables write/mutation buttons in components.

---

## 6. Layout Feature Modules & System Guidelines

### 6.1 Notification Center (Drawer Layout)
- **Visuals:** Slides out from the right (width 380px) on bell icon header clicks. Dims background.
- **Features:** Grouped by "New" and "Read" notifications. Sourced dynamically from the `notifications` table: `supabase.from('notifications').select('*').eq('user_id', auth.uid())`.
- **Action:** A button **"Mark all as read"** at the top right header inside the drawer calls: `supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', auth.uid()).is('read_at', null)`. Real-time notifications (leave review updates, payroll processed) trigger local Toast banners.

### 6.2 [OPTIONAL / Future Enhancement - Out of Scope for v1.0] Announcements Board
- **UI:** A grid card layout on the Dashboard main panel displaying organization-wide updates.
- **Admin Control:** Admin has an "/admin/announcements" route containing a post form to publish new announcements. (Note: The announcements table does not exist in the active database schema for v1.0 and is reserved for future phases).

### 6.3 [OPTIONAL / Future Enhancement - Out of Scope for v1.0] Organization & Department Settings
- **Settings Screen (`(admin)/settings`):** Accessible only to Admins.
  - Fields: Organization Name, Address, Working Hours Threshold, Check-in Grace Period (minutes).
- **Department Manager Panel:** Table displaying existing departments (HR, Engineering, Operations) and employee counts. Contains edit buttons and a **"+ Add Department"** modal.
- (Note: Multi-tenant/multi-company management and separate department tables are out of scope for v1.0 per PRD §7.0 / Backend Spec Decision 1. A default organization is seeded in the migration).

### 6.4 [OPTIONAL / Future Enhancement - Out of Scope for v1.0] Holidays Calendar
- **UI:** Grid table displaying company holiday schedules.
- **Rules:** Holiday dates are excluded from Leave balance subtraction formulas and marked as green block overlays in the employee attendance calendar views.
- (Note: Public holiday tables and exclusion rules from leave duration remain an open design question (Backend Spec Open Question 1) and are out of scope for v1.0).

### 6.5 Loading Skeletons & Error Boundaries
- **Skeletons:** Every list, table, and statistics card must map to a skeleton loader (`animate-pulse border-b border-surface-border h-12 bg-slate-100 dark:bg-slate-800 rounded`) to prevent CLS layout shifts.
- **Error Boundaries:** Each App Router route group utilizes custom `error.tsx` boundary handlers displaying:
  - Error illustration.
  - Human-friendly message (sanitized, hides system stack traces).
  - **"Try Again"** button which re-executes query hooks.

### 6.6 [OPTIONAL / Future Enhancement - Out of Scope for v1.0] Internationalization (i18n) & Feature Flags
- **i18n:** Text assets are mapped to localization dictionaries (`en-US`, `hi-IN` placeholders). Sourced via a `useLanguage` context hook.
- **Feature Flags:** Integrates a client-side hook `useFeatureFlags` that fetches toggles, selectively rendering experimental UI surfaces.

---

## 7. Frontend Testing Strategy

Quality assurance standards require three testing layers to prevent interface regressions.

### 7.1 Unit Testing (Vitest & React Testing Library)
- **Scope:** Component state rendering, event triggers, validation regex patterns.
- **Mocking:** API integrations are mocked using **Mock Service Worker (MSW)**, preventing external database requests during testing runs.
- **Command:** `npm run test:unit`

### 7.2 Integration & Client Cache Testing
- **Scope:** React query custom hooks cache states, prefetching, and query invalidation.
- **Command:** `npm run test:integration`

### 7.3 End-to-End Testing (Playwright)
- **Scope:** Complete user flows:
  - Onboarding Activation flow (Invite activation email mock -> set password -> verify login).
  - Attendance check-in/out button clicks and gauge statistics.
  - Admin directory search filters and modals.
- **Command:** `npx playwright test`

---

## 8. Accessibility Requirements (WCAG 2.1 AA Compliance)

- **Keyboard Navigation:** Every actionable element (button, table link, drawer input) must be reachable via `Tab` indexes. Modals and drawers must lock focus within the active layout boundaries on display.
- **ARIA Standards:** Inputs must possess matching `<label htmlFor="[ID]">` bindings. Icon-only buttons (close buttons, chevron navigators) must explicitly specify `aria-label` tags.
- **Color Contrast:** Text-to-background contrast ratios must measure >= 4.5:1 (verified using automated lighthouse checks).
- **Alt Text:** Every logo, profile avatar image, and illustration requires descriptive `alt` tags.

---

## 9. "Lighter & Faster" Performance Budget

- **Bundle Constraint:** Total initial JavaScript bundle size per page must remain under **150KB gzipped**.
- **First Load JS:** Strict monitoring of imported NPM dependencies. Use native browser functions where possible.
- **React Server Components (RSC):** Render all page wrappers, summaries, and directory grids on the server. Limit client components (`'use client'`) to interactive controls.
- **Web Vitals targets:** FCP < 1.0s, LCP < 1.5s, TBT < 100ms.

---

## Changes Made to Align with PRD

1. **Removed Custom Go API Wrapper:** Replaced Go REST endpoint mappings with direct Supabase PostgREST client queries (`supabase.from()`) for all employee and admin screens.
2. **Standardized Mutations:** Defined a single consistent mutation path targeting corresponding RLS database tables directly.
3. **Integrated Edge Functions:** Replaced backend admin invite and terminate requests with Supabase Edge Functions (`/invite-employee`, `/terminate-employee`).
4. **Document Storage Realignment:** Specified direct file uploads and folder listings inside Supabase Storage private `documents` bucket, removing metadata API registration wrappers.
5. **Session Management Refactor:** Integrated cookie session managers using `@supabase/ssr` middleware, removing custom JWT validates.
6. **Environment Variables Clean Up:** Removed custom backend URLs, requiring only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
