# BrightPath CRM — Master Execution Plan & Feature Roadmap

> **Context Document**: This file serves as the in-repo source of truth and persistent context for the AI pair-programming assistant and engineering team. It tracks the step-by-step implementation of BrightPath CRM according to the master specification (`BrightPath_CRM_Full_Master_Build_Prompt.docx`).

---

## 1. Operating Rules & Engineering Guidelines

1. **Feature-by-Feature Progression**: Features are implemented in strict sequential order.
2. **6-Step Phase Lifecycle**:
   $$\text{Develop} \longrightarrow \text{Test (static/build)} \longrightarrow \text{Verify (functional/responsive)} \longrightarrow \text{Milestone Commit} \longrightarrow \text{Post-Check} \longrightarrow \text{User Approval Gate}$$
3. **No Unverified Success**: Never claim a test, query, or deployment succeeded without direct verification.
4. **Data Truthfulness**: Real PostgreSQL queries and reconciled counts; zero hardcoded fake analytics disguised as live data.
5. **Security First**: Row Level Security (RLS) on all client-facing tables; no privileged keys (`service_role`, DB passwords) in frontend code.

---

## 2. Phase Execution Tracker

- [x] **Phase 0: Project Baseline, Git Repository & TypeScript Setup** *(Completed: Commit `1c230d7`)*
- [ ] **Phase 1: Design System & Global Responsive Shell**
- [ ] **Phase 2: Supabase Client & Configuration Diagnostics**
- [ ] **Phase 3: Database Schema, Row Level Security & Demo Seed SQL**
- [ ] **Phase 4: Authentication, Session Lifecycle & Role-Based RBAC**
- [ ] **Phase 5: Core Lead Listing, Live Search & Multi-Attribute Filters**
- [ ] **Phase 6: Lead Creation & Edit Modal with Strict Validation**
- [ ] **Phase 7: Lead Status Progression Lifecycle & Lost Reason Rule**
- [ ] **Phase 8: Follow-Up Scheduling & Overdue Management Engine**
- [ ] **Phase 9: Lead Detail View & Audit Activity Timeline**
- [ ] **Phase 10: Real-Time Analytics Dashboard & Reconciled KPIs**
- [ ] **Phase 11: Reports & Audit CSV Export**
- [ ] **Phase 12: Accessibility, Mobile Drawer & Error Polish**
- [ ] **Phase 13: End-to-End Test Suite & Student Handover Documentation**
- [ ] **Phase 14: GitHub Repository & Vercel Production Deployment**

---

## 3. Detailed Phase Breakdown

### Phase 0: Project Baseline, Git Repository & TypeScript Setup
- **Status**: **COMPLETED** (Commit: `1c230d7070e16a1afd03189ed6edf2471a3c7258`)
- **Delivered**:
  - Initialized Git repository.
  - Configured `.gitignore` for `.env`, `.env.*`, `!.env.example`, `*.tsbuildinfo`, `.vercel`.
  - Installed `@supabase/supabase-js`, `lucide-react`, `typescript`, `@types/node`.
  - Configured `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`.
  - Migrated entry point to `src/main.tsx` and created starter `src/App.tsx`.
  - Configured `npm run build` to enforce `tsc -b && vite build`.
  - Verified static build and ESLint pass with 0 errors.

---

### Phase 1: Design System & Global Responsive Shell
- **Goal**: Create a modern education-SaaS visual identity and responsive app layout.
- **What to Implement**:
  - Design tokens in `src/index.css`: Navy `#0f172a`/`#1e293b`, royal blue `#2563eb`, neutral slate `#f8fafc`, semantic status colors (New, Contacted, Qualified, Converted, Lost).
  - Navigation Shell:
    - Collapsible desktop sidebar with nav links: Dashboard, Leads, Follow-ups, Reports, Settings.
    - Top header: Active view title, search shortcut, role badge, notifications icon, user profile menu.
    - Mobile bottom/drawer navigation for screens $<768\text{px}$.
  - Reusable UI Atoms: `Button`, `Input`, `Select`, `Badge`, `Card`, `StatCard`, `EmptyState`, `LoadingSpinner`.
- **Target Files**:
  - `src/index.css`
  - `src/components/layout/AppLayout.tsx`
  - `src/components/layout/Sidebar.tsx`
  - `src/components/layout/Header.tsx`
  - `src/components/layout/MobileNav.tsx`
  - `src/components/ui/Button.tsx`, `Badge.tsx`, `Card.tsx`, `StatCard.tsx`, `EmptyState.tsx`, `LoadingSpinner.tsx`
  - `src/App.tsx`
- **Acceptance Criteria**:
  - Responsive across 360px (mobile) to 1440px+ (desktop).
  - Tab switching smoothly toggles view states without page reloads.
  - Zero TypeScript errors (`npm run build`).

---

### Phase 2: Supabase Client & Configuration Diagnostics
- **Goal**: Initialize the Supabase client safely with user-friendly configuration feedback.
- **What to Implement**:
  - Dedicated client module in `src/lib/supabaseClient.ts`.
  - Environment variable validator for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
  - `.env.example` file with placeholder keys and security instructions.
  - `ConfigNotice` UI component: Displays setup instructions if `.env` is unconfigured, preventing app crash.
- **Target Files**:
  - `src/lib/supabaseClient.ts`
  - `.env.example`
  - `src/components/feedback/ConfigNotice.tsx`
- **Acceptance Criteria**:
  - App displays clear configuration instructions if environment variables are missing.
  - App connects smoothly when valid credentials are provided.
  - `npm run build` succeeds.

---

### Phase 3: Database Schema, Row Level Security & Demo Seed SQL
- **Goal**: Provide reproducible SQL migrations for the relational data model, RLS policies, and demo data.
- **What to Implement**:
  - `001_initial_schema.sql`:
    - `profiles` table (id references `auth.users(id)`, full_name, role `admin`|`manager`|`counsellor`, timestamps).
    - `leads` table (id, full_name, email, phone, course_interest, source, status, lost_reason, assigned_to, created_by, notes, timestamps).
    - `follow_ups` table (id, lead_id, assigned_to, due_at, note, status `pending`|`completed`|`cancelled`, completed_at, created_by, created_at).
    - `activities` table (id, lead_id, actor_id, activity_type, description, metadata JSONB, created_at).
    - Foreign keys, `updated_at` automated trigger, performance indexes.
  - `002_rls_policies.sql`:
    - Enable RLS on all 4 tables.
    - Strict anti-self-promotion policy on `profiles.role`.
    - Counsellor, Manager, Admin access policies.
  - `003_demo_seed.sql`:
    - Idempotent seed data for BrightPath Academy (JEE, NEET, Full Stack Web Dev leads, sources, follow-ups).
  - Documentation in `supabase/README.md`.
- **Target Files**:
  - `supabase/migrations/001_initial_schema.sql`
  - `supabase/migrations/002_rls_policies.sql`
  - `supabase/migrations/003_demo_seed.sql`
  - `supabase/README.md`
- **Acceptance Criteria**:
  - Clean SQL syntax valid for Supabase SQL Editor.
  - Detailed instructions for applying migrations.

---

### Phase 4: Authentication, Session Lifecycle & Role-Based RBAC
- **Goal**: Implement multi-user auth, session restoration, and role detection.
- **What to Implement**:
  - `AuthContext` provider managing `user`, `profile`, `role`, and `loading`.
  - Sign-in modal/page (email/password) with validation and loading states.
  - Profile resolver loading profile for `auth.uid()`.
  - Demo/Workshop mode: Role switcher for local previewing (Admin, Manager, Counsellor).
- **Target Files**:
  - `src/types/auth.ts`
  - `src/services/authService.ts`
  - `src/context/AuthContext.tsx`
  - `src/features/auth/SignInModal.tsx`
  - `src/components/layout/HeaderUserMenu.tsx`
- **Acceptance Criteria**:
  - Login, logout, session restoration work reliably.
  - Top header reflects current user name and role badge.

---

### Phase 5: Core Lead Listing, Live Search & Multi-Attribute Filters
- **Goal**: Build the searchable, filterable lead table and mobile cards.
- **What to Implement**:
  - Leads table view (Name, Contact, Course, Source, Status, Assignee, Next Follow-up, Date).
  - Search input filtering in real-time by student name, phone, email.
  - Multi-attribute filters: Status, Source, Assigned Counsellor, with "Reset Filters" action.
  - Responsive mobile cards view for smaller screens.
  - Skeletons, empty search results, and error states.
- **Target Files**:
  - `src/types/leads.ts`
  - `src/services/leadsService.ts`
  - `src/features/leads/LeadListView.tsx`
  - `src/features/leads/LeadTable.tsx`
  - `src/features/leads/LeadCardMobile.tsx`
  - `src/features/leads/LeadFilterBar.tsx`
- **Acceptance Criteria**:
  - Leads load from database; search and combined filters work accurately.
  - Reset filters clears all filters and restores full list.

---

### Phase 6: Lead Creation & Edit Modal with Strict Validation
- **Goal**: Allow capturing new student enquiries and editing existing leads with data validation.
- **What to Implement**:
  - "New Lead" modal dialog with validation:
    - Full Name (required, trimmed).
    - Phone Number (required, phone format check).
    - Email (optional, valid format check).
    - Course Interest (required dropdown).
    - Source (required dropdown).
    - Assignee (dropdown from `profiles`).
    - Notes (optional textarea).
  - Duplicate submission lock (disabled button + spinner while saving).
  - Edit Lead Modal with pre-filled values.
  - Toast notification system for save confirmations.
- **Target Files**:
  - `src/features/leads/LeadModal.tsx`
  - `src/features/leads/LeadForm.tsx`
  - `src/utils/validation.ts`
  - `src/context/ToastContext.tsx`
- **Acceptance Criteria**:
  - Invalid input displays clear error messages and prevents submission.
  - Saved leads immediately appear in the list and persist across page refresh.

---

### Phase 7: Lead Status Progression Lifecycle & Lost Reason Rule
- **Goal**: Implement guided status progression and enforce lost reason capture.
- **What to Implement**:
  - Status pipeline: `New` $\rightarrow$ `Contacted` $\rightarrow$ `Qualified` $\rightarrow$ `Converted` $\rightarrow$ `Lost`.
  - Mandatory **Lost Reason Dialog** triggered when selecting `Lost`.
  - Prevent saving `Lost` without a reason.
  - Automatic activity record logged in `activities` table with metadata `{ from_status, to_status, lost_reason }`.
- **Target Files**:
  - `src/features/leads/LeadStatusSelect.tsx`
  - `src/features/leads/LostReasonModal.tsx`
  - `src/services/activitiesService.ts`
- **Acceptance Criteria**:
  - Status transitions persist in database.
  - Marking `Lost` requires selecting/entering a valid reason.

---

### Phase 8: Follow-Up Scheduling & Overdue Management Engine
- **Goal**: Prevent dropped enquiries with timed follow-ups and overdue tracking.
- **What to Implement**:
  - Follow-up tracker view and Lead Detail follow-up list.
  - "Schedule Follow-up" modal: Lead selection, Due Date & Time (`timestamptz`), Assignee, Note.
  - Overdue logic: `status = 'pending' AND due_at < now()`.
  - Visual status badges: Overdue (Red), Due Today (Amber), Upcoming (Blue), Completed (Green).
  - "Mark Completed" 1-click action updating `status='completed'` and `completed_at=now()`.
  - Quick link to jump from follow-up to the related lead.
- **Target Files**:
  - `src/types/followups.ts`
  - `src/services/followUpsService.ts`
  - `src/features/followups/FollowUpListView.tsx`
  - `src/features/followups/FollowUpCard.tsx`
  - `src/features/followups/FollowUpModal.tsx`
- **Acceptance Criteria**:
  - Overdue items correctly calculated based on current time.
  - Completed items reflect timestamp and clear overdue flag.

---

### Phase 9: Lead Detail View & Audit Activity Timeline
- **Goal**: Provide a full 360° lead detail view with interaction history.
- **What to Implement**:
  - Slide-over drawer / page displaying contact details, course, source, counsellor.
  - Contact quick actions (Call, WhatsApp, Email).
  - Notes viewer with "Add Note" quick form.
  - Scheduled follow-ups section for this lead.
  - Chronological Activity Timeline displaying lead creation, status changes, notes, follow-up events.
- **Target Files**:
  - `src/features/leads/LeadDetailView.tsx`
  - `src/features/activity/ActivityTimeline.tsx`
  - `src/features/activity/ActivityItem.tsx`
- **Acceptance Criteria**:
  - Every action performed on a lead shows up in the timeline with actor name and timestamp.

---

### Phase 10: Real-Time Analytics Dashboard & Reconciled KPIs
- **Goal**: Executive overview with truthful, mathematically reconciled metrics.
- **What to Implement**:
  - 5 KPI Cards:
    1. Total Accessible Leads
    2. New Leads (`status = 'New'`)
    3. Converted Leads (`status = 'Converted'`)
    4. Overdue Follow-ups (`status = 'pending' AND due_at < now()`)
    5. Conversion Rate % ($\frac{\text{Converted}}{\text{Total}} \times 100$, division-by-zero protected)
  - Visual distributions: Leads by Status bar, Leads by Source breakdown.
  - Urgent Action Cards: Overdue follow-ups list, Recent leads list.
  - Role-scoped metrics (counsellor sees personal counts, manager/admin sees team aggregate).
- **Target Files**:
  - `src/services/metricsService.ts`
  - `src/features/dashboard/DashboardView.tsx`
  - `src/features/dashboard/KpiGrid.tsx`
  - `src/features/dashboard/PipelineChart.tsx`
  - `src/features/dashboard/RecentLeadsCard.tsx`
- **Acceptance Criteria**:
  - Dashboard counts reconcile 100% with the Lead List counts.
  - Handles 0 leads without NaN or layout breaks.

---

### Phase 11: Reports & Audit CSV Export
- **Goal**: Summary reporting by lead source and secure data export.
- **What to Implement**:
  - Source Effectiveness table (Leads, Converted, Conversion %).
  - Counsellor Workload table (Assigned leads, Completed follow-ups, Admissions).
  - CSV Export: Client-side sanitized export of filtered leads.
- **Target Files**:
  - `src/features/reports/ReportsView.tsx`
  - `src/services/reportsService.ts`
  - `src/utils/csvExport.ts`
- **Acceptance Criteria**:
  - CSV exports successfully and opens cleanly in Excel/Numbers.

---

### Phase 12: Accessibility, Mobile Drawer & Error Polish
- **Goal**: Full responsive ergonomics, WCAG accessibility, and error boundaries.
- **What to Implement**:
  - React `ErrorBoundary` with reload button.
  - Keyboard navigation: Modals trap focus, `Escape` closes dialogs, `:focus-visible` rings.
  - Screen reader labels (`aria-label`) on all interactive icon buttons.
  - Touch-friendly targets ($\ge 44\text{px}$) and smooth mobile drawer.
- **Target Files**:
  - `src/components/feedback/ErrorBoundary.tsx`
  - `src/components/feedback/ToastContainer.tsx`
  - `src/index.css`
- **Acceptance Criteria**:
  - App is fully navigable via keyboard only.
  - Mobile layout is responsive and ergonomic on small viewports.

---

### Phase 13: End-to-End Test Suite & Student Handover Documentation
- **Goal**: Complete verification matrix and comprehensive documentation.
- **What to Implement**:
  - Verify all acceptance tests (CRUD, filters, follow-ups, auth, metrics).
  - Comprehensive `README.md` with architecture diagrams, setup commands, and troubleshooting.
  - `TEST_CHECKLIST.md` documenting test results.
- **Target Files**:
  - `README.md`
  - `TEST_CHECKLIST.md`
- **Acceptance Criteria**:
  - `npm run build` passes cleanly.
  - Documentation accurately describes all implemented functionality.

---

### Phase 14: GitHub Repository & Vercel Production Deployment
- **Goal**: Deploy the application to Vercel and verify the live public URL.
- **What to Implement**:
  - `vercel.json` SPA routing rewrite configuration.
  - Step-by-step GitHub push and Vercel import instructions.
  - Environment variable setup in Vercel (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
  - Live deployment smoke test checklist.
- **Target Files**:
  - `vercel.json`
  - `VERCEL_DEPLOYMENT.md`
- **Acceptance Criteria**:
  - Live production URL opens, connects to Supabase, and allows lead creation and follow-up management.

---

## 4. Verification & Testing Commands

```powershell
# Type-check and production bundle build
npm run build

# Code style and lint check
npm run lint

# Start local development server
npm run dev

# Git status and commit history
git status
git log --oneline -5
```
