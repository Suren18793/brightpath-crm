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
- [x] **Phase 1: Design System & Global Responsive Shell** *(Completed: Commit `749ab5a`)*
- [x] **Phase 2: Supabase Client & Configuration Diagnostics** *(Completed: Commit `6d743e7`)*
- [x] **Phase 3: Database Schema, Row Level Security & Demo Seed SQL** *(Completed: Commit `0001b6d`)*
- [x] **Phase 4: Authentication, Session Lifecycle & Role-Based RBAC** *(Completed: Commit `d3abad6`)*
- [x] **Phase 5: Core Lead Listing, Live Search & Multi-Attribute Filters** *(Completed: Commit `ade7a9f`)*
- [x] **Phase 6: Lead Creation & Edit Modal with Strict Validation** *(Completed: Commit `b94b972`)*
- [x] **Phase 7: Lead Status Progression Lifecycle & Lost Reason Rule** *(Completed: Commit `abc6c21`)*
- [x] **Phase 8: Follow-Up Scheduling & Overdue Management Engine** *(Completed: Commit `b486b83`)*
- [x] **Phase 9: Lead Detail View & Audit Activity Timeline** *(Completed: Commit `d18e698`)*
- [x] **Phase 10: Real-Time Analytics Dashboard & Reconciled KPIs** *(Completed: Commit `da2802a`)*
- [x] **Phase 11: Reports & Audit CSV Export** *(Completed: Commit `5b54340`)*
- [x] **Phase 12: Accessibility, Mobile Drawer & Error Polish** *(Completed: Commit `99c2d90`)*
- [x] **Phase 13: End-to-End Test Suite & Student Handover Documentation** *(Completed: Commit `ac39eab`)*
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
- **Status**: **COMPLETED** (Commit: `d3abad6`)
- **Goal**: Implement multi-user auth, session restoration, and role detection.
- **Delivered**:
  - `src/types/auth.ts`: Roles (`admin`, `manager`, `counsellor`), permissions mapping, and `AuthContextValue` interface.
  - `src/services/authService.ts`: GoTrue auth wrapper, session persistence, automatic profile creation, and real-time auth state listener.
  - `src/context/AuthContext.tsx`: React Context provider managing user, profile, active role, workshop preview state, and permission evaluator.
  - `src/features/auth/SignInModal.tsx`: Accessible dialog with Sign In/Register tabs, input validation, error handling, and 1-click workshop demo accounts.
  - `src/components/layout/HeaderUserMenu.tsx`: Interactive header profile dropdown with initials avatar, role badge, instant role switcher, and auth triggers.
  - `src/App.tsx` & `src/index.css`: Integrated with `AuthProvider`, dynamic session indicator banner, and smooth styling.
  - Verification: `npm run build` and `npm run lint` pass with 0 errors.

---

### Phase 5: Core Lead Listing, Live Search & Multi-Attribute Filters
- **Status**: **COMPLETED** (Commit: `ade7a9f`)
- **Goal**: Build the searchable, filterable lead table and mobile cards with dual-mode Supabase/Local fallback.
- **Delivered**:
  - `src/types/leads.ts`: Types for `Lead`, `LeadStatus`, `LeadSource`, `LeadFilterState`, `LeadStats`.
  - `src/services/leadsService.ts`: Dual-mode query engine with real Supabase table query support, role-scoped queries, fallback local persistence, and counsellor listing.
  - `src/features/leads/LeadFilterBar.tsx`: Real-time search with clear button, Status dropdown, Source dropdown, Assignee selector, sort controller, and active filter counter with 1-click Reset button.
  - `src/features/leads/LeadTable.tsx`: Full responsive data table with sortable column headers, phone/email links, status badges, next follow-up alerts, skeleton loaders, and empty search results state.
  - `src/features/leads/LeadCardMobile.tsx`: Mobile card view for screens $<768\text{px}$ with direct 1-tap phone and WhatsApp outreach shortcuts.
  - `src/features/leads/LeadListView.tsx`: Master view container with summary metric quick-filter chips, missing database schema diagnostic ribbon, and app layout integration.
  - Verification: `npm run build` and `npm run lint` pass with 0 errors.

---

### Phase 6: Lead Creation & Edit Modal with Strict Validation
- **Status**: **COMPLETED** (Commit: `b94b972`)
- **Goal**: Allow capturing new student enquiries and editing existing leads with data validation.
- **Delivered**:
  - `src/utils/validation.ts`: Strict field validation for student full name, international/Indian phone format, optional RFC email, course interest, acquisition source, and notes length.
  - `src/context/ToastContext.tsx`: Global accessible toast notification provider (`success`, `error`, `info` variants with auto-dismiss).
  - `src/features/leads/LeadForm.tsx`: Controlled form with field-level blur/submit validation, duplicate submission lock, role-aware counsellor assignment, and 1-click sample student prefill helper.
  - `src/features/leads/LeadModal.tsx`: Accessible Create & Edit Lead modal dialog with Escape key handling and error banner.
  - `src/services/leadsService.ts`: Added `createLead` and `updateLead` with dual-mode Supabase + LocalStorage fallback persistence.
  - `src/features/leads/LeadListView.tsx`, `LeadTable.tsx`, `LeadCardMobile.tsx`, `src/App.tsx`: Wired "+ New Lead" (both global header and lead view) and row/card "Edit" triggers with instant list & KPI chip refresh.
  - Verification: `npm run build` and `npm run lint` pass with 0 errors.

---

### Phase 7: Lead Status Progression Lifecycle & Lost Reason Rule
- **Status**: **COMPLETED** (Commit: `abc6c21`)
- **Goal**: Implement guided status progression and enforce lost reason capture.
- **Delivered**:
  - `src/services/activitiesService.ts`: Dual-mode activity audit logger (`public.activities` + LocalStorage fallback) supporting `created`, `status_changed`, `followup_added`, `followup_completed`, `note_added`, and `lead_reassigned` with structured metadata `{ from_status, to_status, lost_reason }`.
  - `src/features/leads/LeadStatusSelect.tsx`: Interactive semantic color-coded status selector (`New`, `Contacted`, `Qualified`, `Converted`, `Lost`) with inline spinner lock and `lost_reason` caption display.
  - `src/features/leads/LostReasonModal.tsx`: Mandatory Lost Reason gate modal with 1-click admissions reason presets, custom reason textarea, and strict non-empty validation before transitioning a lead to `Lost`.
  - `src/services/leadsService.ts` & `supabase/migrations/002_rls_policies.sql`: Added `updateLeadStatus` enforcing the Lost Reason rule and recording audit history, plus updated counsellor scoping to include unassigned seeded leads (`assigned_to IS NULL`).
  - `src/features/leads/LeadListView.tsx`, `LeadTable.tsx`, `LeadCardMobile.tsx`: Wired inline status progression and Lost Reason modal across desktop and mobile views with instant KPI status chip reconciliation.
  - Verification: `npm run build` and `npm run lint` pass with 0 errors.

---

### Phase 8: Follow-Up Scheduling & Overdue Management Engine
- **Status**: **COMPLETED** (Commit: `b486b83`)
- **Goal**: Prevent dropped enquiries with timed follow-ups and overdue tracking.
- **Delivered**:
  - `src/types/followups.ts`: Types for `FollowUpRecord`, `FollowUpUrgency`, `FollowUpStats`, plus real-time urgency calculator [`computeFollowUpUrgency`](file:///c:/Users/kanha/brightpath-crm/src/types/followups.ts#L50-L79) (`status = 'pending' AND due_at < now()`).
  - `src/services/followUpsService.ts`: Dual-mode follow-up engine (`public.follow_ups` + LocalStorage fallback) with automatic parent lead `next_followup_due` synchronization and `'followup_added'` / `'followup_completed'` audit logging.
  - `src/features/followups/FollowUpCard.tsx`: Semantic urgency cards (`Overdue`, `Due Today`, `Upcoming`, `Completed`), direct Call/WhatsApp outreach shortcuts, "View Lead" quick jump, and 1-click "Mark Completed" action.
  - `src/features/followups/FollowUpModal.tsx`: Accessible scheduler dialog with student lead selector, `datetime-local` input, 1-click time presets (`+2 Hours`, `Tomorrow 10 AM`, `+2 Days`, `Test Overdue (-2h)`), and action note presets.
  - `src/features/followups/FollowUpListView.tsx` & `src/App.tsx`: Full follow-up tracker view with urgency filter chips, live search, overdue warning banner, and reconciled sidebar/header notification badge.
  - Verification: `npm run build` and `npm run lint` pass with 0 errors.

---

### Phase 9: Lead Detail View & Audit Activity Timeline
- **Status**: **COMPLETED** (Commit: `d18e698`)
- **Goal**: Provide a full 360° lead detail view with interaction history.
- **Delivered**:
  - `src/features/activity/ActivityItem.tsx`: Chronological audit node rendering semantic icon badges, status transition pills (`from_status → to_status`), `lost_reason` callouts, actor attribution, and timestamps.
  - `src/features/activity/ActivityTimeline.tsx`: Vertical connected timeline feed with loading skeletons and empty state.
  - `src/features/leads/LeadDetailView.tsx`: Slide-over 360° drawer displaying student metadata, 1-click Call/WhatsApp/Email outreach buttons, inline [`LeadStatusSelect`](file:///c:/Users/kanha/brightpath-crm/src/features/leads/LeadStatusSelect.tsx), counselling notes viewer + "Add Note" quick form, lead-specific follow-ups list + "+ Schedule" modal trigger, and live [`ActivityTimeline`](file:///c:/Users/kanha/brightpath-crm/src/features/activity/ActivityTimeline.tsx).
  - `src/services/leadsService.ts`, `LeadListView.tsx`, `src/App.tsx`: Added [`addLeadNote`](file:///c:/Users/kanha/brightpath-crm/src/services/leadsService.ts#L702-L735) (persisting to `public.leads` and logging `'note_added'` to `public.activities`) and wired row/card clicks and Follow-Up "View Lead" jumps directly to the 360° drawer.
  - Verification: `npm run build` and `npm run lint` pass with 0 errors.

---

### Phase 10: Real-Time Analytics Dashboard & Reconciled KPIs
- **Status**: **COMPLETED** (Commit: `da2802a`)
- **Goal**: Executive overview with truthful, mathematically reconciled metrics.
- **Delivered**:
  - `src/services/metricsService.ts`: Implemented [`getDashboardMetrics`](file:///c:/Users/kanha/brightpath-crm/src/services/metricsService.ts#L68-L171) computing role-scoped, 100% reconciled counts across [`leadsService`](file:///c:/Users/kanha/brightpath-crm/src/services/leadsService.ts) and [`followUpsService`](file:///c:/Users/kanha/brightpath-crm/src/services/followUpsService.ts) with division-by-zero protection (`0` leads $\rightarrow$ `0.0%` without `NaN`).
  - `src/features/dashboard/KpiGrid.tsx`: 5 interactive KPI cards (`Total Accessible Leads`, `New Enquiries`, `Converted Admissions`, `Overdue Follow-Ups`, `Conversion Rate %`) with loading skeletons and direct navigation hooks.
  - `src/features/dashboard/PipelineChart.tsx`: Stacked horizontal 5-stage pipeline distribution bar (`New`, `Contacted`, `Qualified`, `Converted`, `Lost`) and channel ROI progress breakdown (`Website`, `Walk-in`, `Phone Call`, `WhatsApp`, `Referral`, `Other`).
  - `src/features/dashboard/RecentLeadsCard.tsx`: Top 5 recent student enquiries table (click any row to open the 360° Lead Detail Drawer) and Urgent & Overdue Follow-Up Action Queue with 1-click "Mark Done" completion.
  - `src/features/dashboard/DashboardView.tsx`, `src/App.tsx`, `src/index.css`: Replaced static placeholder dashboard with live [`DashboardView`](file:///c:/Users/kanha/brightpath-crm/src/features/dashboard/DashboardView.tsx) and responsive 5-column KPI grid styles.
  - Verification: `npm run build` and `npm run lint` pass with 0 errors.

---

### Phase 11: Reports & Audit CSV Export
- **Status**: **COMPLETED** (Commit: `5b54340`)
- **Goal**: Summary reporting by lead source and secure data export.
- **Delivered**:
  - `src/utils/csvExport.ts`: Implemented [`sanitizeCsvCell`](file:///c:/Users/kanha/brightpath-crm/src/utils/csvExport.ts#L8-L24) (neutralizing OWASP CSV formula injection on `=`, `+`, `-`, `@`, `\t`, `\r` and escaping quotes per RFC 4180), [`exportLeadsToCsv`](file:///c:/Users/kanha/brightpath-crm/src/utils/csvExport.ts#L53-L102), and [`exportReportsSummaryToCsv`](file:///c:/Users/kanha/brightpath-crm/src/utils/csvExport.ts#L107-L176) with UTF-8 BOM (`\uFEFF`) for clean Excel/Numbers compatibility.
  - `src/services/reportsService.ts`: Implemented [`getReportsSummary`](file:///c:/Users/kanha/brightpath-crm/src/services/reportsService.ts#L69-L263) computing role-scoped, 100% reconciled Source Effectiveness, Counsellor Workload, and Course Demand breakdown tables.
  - `src/features/reports/ReportsView.tsx`: Full executive Reports screen with Source Effectiveness table (including footer totals), Counsellor Workload & Admissions Performance table, Course Demand breakdown, and 1-click CSV export buttons.
  - `src/features/leads/LeadListView.tsx`, `src/App.tsx`, `src/index.css`: Wired `<ReportsView />` into the Reports tab and added an inline **"Export CSV"** button in the Lead Management toolbar for exporting filtered leads.
  - Verification: `npm run build` and `npm run lint` pass with 0 errors.

---

### Phase 12: Accessibility, Mobile Drawer & Error Polish
- **Status**: **COMPLETED** (Commit: `99c2d90`)
- **Goal**: Full responsive ergonomics, WCAG accessibility, and error boundaries.
- **Delivered**:
  - `src/components/feedback/ErrorBoundary.tsx` & `src/main.tsx`: Global React error boundary catching uncaught runtime exceptions with **Reload Application** and **Reset Demo Cache & Reload** recovery buttons.
  - `src/components/feedback/ToastContainer.tsx` & `src/context/ToastContext.tsx`: Extracted accessible notification stack with `role="region"`, `aria-live="polite"`, and `Escape` key dismissal.
  - `src/components/layout/AppLayout.tsx`, `MobileNav.tsx`, `Sidebar.tsx`, `Header.tsx`, `KpiGrid.tsx`: Added WCAG `"Skip to main content"` shortcut link, `Escape` key close and body scroll lock on the mobile drawer, `aria-current="page"` and `aria-label` attributes, `Enter`/`Space` keyboard activation on KPI cards, and global quick search (`Enter` jumps to filtered Leads view).
  - `src/index.css`: Added $\ge 44\text{px}$ mobile touch targets, error boundary layout styles, and `@media (prefers-reduced-motion: reduce)` support.
  - Verification: `npm run build` and `npm run lint` pass with 0 errors.

---

### Phase 13: End-to-End Test Suite & Student Handover Documentation
- **Status**: **COMPLETED** (Commit: `ac39eab`)
- **Goal**: Complete verification matrix and comprehensive documentation.
- **Delivered**:
  - `TEST_CHECKLIST.md`: Complete 27-point end-to-end verification matrix (`TC-01` through `TC-27`) covering TypeScript build, ESLint, dual-mode persistence, RBAC role scoping, lead CRUD & validation, mandatory Lost Reason gate, overdue follow-up calculations, 360° drawer & audit timeline, reconciled KPIs & division-by-zero safety, OWASP CSV sanitization, and WCAG accessibility.
  - `README.md`: Comprehensive student handover manual with Mermaid architecture diagram, repository map, Zero-Config Workshop Preview Mode quick start, full Supabase SQL migration guide, demo staff credentials table, and troubleshooting reference.
  - Verification: `npm run build` and `npm run lint` pass with 0 errors.

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
