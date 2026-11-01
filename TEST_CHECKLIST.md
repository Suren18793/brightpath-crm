# BrightPath CRM — End-to-End Verification & Acceptance Test Matrix

> **Purpose**: This document records the complete functional, data-integrity, security, accessibility, and build verification test suite for **BrightPath CRM**. Every test case below is designed to work in **both** operational modes:
> 1. **Zero-Config Workshop Preview Mode** (No Supabase project setup required — persists state in `localStorage`).
> 2. **Live Supabase Cloud Mode** (Connected to PostgreSQL + Row Level Security via `.env`).

---

## 1. Automated Static, Type-Safety & Production Build Verification

| Test ID | Verification Check | Command | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-01** | TypeScript Strict Mode Compilation | `npx tsc -b` | Zero type errors across all `.ts` and `.tsx` modules. | **PASS** |
| **TC-02** | Production Bundle Build | `npm run build` | Vite builds optimized CSS & JS bundles into `dist/` with exit code `0`. | **PASS** |
| **TC-03** | ESLint Static Code Analysis | `npm run lint` | Zero lint errors or warnings across the repository. | **PASS** |
| **TC-04** | Secret & Credential Hygiene | `git status --ignored` | `.env` is git-ignored; only `.env.example` and `VITE_SUPABASE_ANON_KEY` (publishable key) patterns are used. Zero `service_role` keys in client code. | **PASS** |

---

## 2. Dual-Mode Persistence & Configuration Diagnostics

| Test ID | Feature Area | Steps to Verify | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-05** | Missing `.env` Graceful Fallback (Workshop Mode) | Start the app without `.env` (or with placeholder values). | App renders without crashing; top `ConfigNotice` banner displays **"Setup Mode"** with a 1-click **"Setup Guide"** assistant modal; seeded demo leads and follow-ups load from `localStorage`. | **PASS** |
| **TC-06** | Live Supabase Connection Detection | Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`. | Sidebar footer beacon turns emerald (`Supabase Connected`) and `leadsService`, `followUpsService`, and `activitiesService` query PostgreSQL tables directly. | **PASS** |

---

## 3. Authentication & Role-Based Access Control (RBAC)

| Test ID | Feature Area | Steps to Verify | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-07** | Workshop Role Switcher (`Counsellor` vs `Manager` vs `Admin`) | Click the role switcher pills (`Counsellor`, `Manager`, `Admin`) in the top Workshop Role Preview bar. | Switching to `Counsellor` scopes the Dashboard, Lead List, Follow-Ups, and Reports to Priya Sharma's assigned/unassigned leads. Switching to `Manager` or `Admin` displays the full institute-wide pipeline. | **PASS** |
| **TC-08** | Preset Demo Staff Sign-In (`SignInModal.tsx`) | Click **Sign In**, select any of the 3 preset role cards (`Priya Sharma — Counsellor`, `Aarav Patel — Manager`, `Dr. Ramesh Verma — Admin`), and submit. | Signs in (or auto-provisions the demo account on first login) and enforces role permissions via `AuthContext` and PostgreSQL RLS (`002_rls_policies.sql`). | **PASS** |

---

## 4. Lead Management, Filtering & Strict Form Validation

| Test ID | Feature Area | Steps to Verify | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-09** | Multi-Attribute Lead Filtering & Live Search | Navigate to **Leads & Enquiries**. Enter a student name/phone in the search bar, and filter by `Status`, `Source`, `Course`, and `Assigned Counsellor`. | Table (desktop) and Cards (mobile) update immediately; result counter (`Showing X of Y accessible leads`) and status chips stay 100% reconciled. | **PASS** |
| **TC-10** | Column Sorting (`Name`, `Status`, `Created Date`) | Click the sortable column headers in the Lead Table. | Toggles ascending/descending sort order cleanly. | **PASS** |
| **TC-11** | Lead Creation & Strict Validation (`validation.ts`) | Click **+ New Lead**. Try submitting an empty form or a phone number with $<10$ digits or an invalid email. | Inline field error messages appear; submit button prevents invalid submission. Clicking **Fill Sample Student** populates valid data and saves the lead. | **PASS** |
| **TC-12** | Lead Editing | Click the **Edit** icon on any lead row/card, modify the course interest or notes, and save. | Lead record updates in place and shows a success toast notification. | **PASS** |

---

## 5. Lead Lifecycle Progression & Mandatory Lost Reason Rule

| Test ID | Feature Area | Steps to Verify | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-13** | Guided Status Progression (`New` $\rightarrow$ `Contacted` $\rightarrow$ `Qualified` $\rightarrow$ `Converted`) | Change a lead's status dropdown from `New` to `Contacted` or `Converted`. | Status badge updates immediately, KPI status chips recalculate, and an audit entry (`status_changed`) is logged in `activities`. | **PASS** |
| **TC-14** | Mandatory Lost Reason Gate (`LostReasonModal.tsx`) | Change any lead's status dropdown to `Lost`. | Transition is intercepted by the **Mark Enquiry as Lost** modal. Submitting with an empty reason is blocked. Selecting a preset reason (e.g., `Joined Competitor Institute`) saves `status = 'Lost'` and displays the lost reason caption under the status selector. | **PASS** |

---

## 6. Follow-Up Scheduling & Overdue Management Engine

| Test ID | Feature Area | Steps to Verify | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-15** | Overdue Urgency Calculation (`computeFollowUpUrgency`) | Navigate to **Follow-ups** and inspect items with `status = 'pending'` and `due_at < now()`. | Items with past `due_at` timestamps are highlighted in rose-red with an `OVERDUE` badge and increment the sidebar notification counter. | **PASS** |
| **TC-16** | Schedule New Follow-Up (`FollowUpModal.tsx`) | Click **+ Schedule Follow-Up**, choose a student lead, click a time preset (`+2 Hours`, `Tomorrow 10 AM`, or `Test Overdue (-2h)`), enter a note, and save. | Follow-up appears in the queue, updates the parent lead's `next_followup_due`, and logs a `followup_added` activity. | **PASS** |
| **TC-17** | 1-Click Mark Completed | Click **Mark Completed** on any pending or overdue follow-up card (in Follow-ups view or Dashboard). | Status transitions to `completed`, `completed_at` is recorded, overdue counter decrements immediately, and `followup_completed` is logged. | **PASS** |

---

## 7. 360° Lead Detail Drawer & Audit Activity Timeline

| Test ID | Feature Area | Steps to Verify | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-18** | 360° Lead Detail Slide-Over (`LeadDetailView.tsx`) | Click any student row in **Leads** or **Dashboard Recent Enquiries**, or click **View Lead** on a follow-up card. | Slide-over drawer opens displaying contact info, 1-click `Call` / `WhatsApp` / `Email` outreach links, inline status selector, notes, lead-specific follow-ups, and the chronological `ActivityTimeline`. | **PASS** |
| **TC-19** | Quick Counselling Note Logging (`addLeadNote`) | Inside the 360° Lead Detail Drawer, type a counselling note and click **Save Note**. | Note is appended to the lead's notes with a timestamp and a `note_added` node appears at the top of the `ActivityTimeline`. | **PASS** |

---

## 8. Reconciled Analytics Dashboard & Division-by-Zero Safety

| Test ID | Feature Area | Steps to Verify | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-20** | 5 Reconciled KPI Cards (`KpiGrid.tsx`) | Compare the 5 KPI cards on **Dashboard** (`Total Accessible Leads`, `New Enquiries`, `Converted Admissions`, `Overdue Follow-Ups`, `Conversion Rate %`) with the counts in **Leads** and **Follow-ups**. | Counts match 100% for the active role (`Counsellor` vs `Manager`/`Admin`). | **PASS** |
| **TC-21** | Division-by-Zero Protection (`0` Leads Edge Case) | Inspect `metricsService.getDashboardMetrics` and `reportsService.getReportsSummary` when `totalLeads === 0`. | `conversionRate` evaluates cleanly to `0.0%` without `NaN`, `Infinity`, or layout breaks. | **PASS** |
| **TC-22** | Pipeline Stage & Source Visual Distributions (`PipelineChart.tsx`) | Inspect the **Pipeline Stage Distribution** stacked bar and **Leads by Acquisition Source** breakdown on the Dashboard. | Percentages and counts sum accurately to `totalLeads`. | **PASS** |

---

## 9. Reports & OWASP Formula-Sanitized CSV Export

| Test ID | Feature Area | Steps to Verify | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-23** | Source Effectiveness & Counsellor Workload Tables (`ReportsView.tsx`) | Navigate to **Reports**. Inspect the **Lead Source Effectiveness Report**, **Counsellor Workload & Admissions Performance**, and **Course Demand** tables. | Footer totals reconcile 100% with accessible leads, conversions, and follow-up counts. | **PASS** |
| **TC-24** | Formula-Sanitized CSV Export (`csvExport.ts`) | Click **Export Leads CSV** (in **Reports** or **Leads**) and **Export Summary CSV**. | Browser downloads `.csv` files with UTF-8 BOM (`\uFEFF`), RFC 4180 quote escaping, and single-quote neutralization (`'`) on values starting with `=`, `+`, `-`, `@` so `+91` phone numbers open cleanly in Excel/Numbers without `#NAME?` formula errors. | **PASS** |

---

## 10. WCAG Accessibility, Mobile Drawer & Error Boundary

| Test ID | Feature Area | Steps to Verify | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-25** | Keyboard Navigation & Skip-to-Content Link | Press `Tab` from the top of the page. | `"Skip to main content"` link appears at top-left; pressing `Enter` focuses `<main id="main-content">`. All modals and drawers close on `Escape`. | **PASS** |
| **TC-26** | Mobile Responsive Layout & $\ge 44\text{px}$ Touch Targets | Resize viewport below `768px`. Open the hamburger menu (`MobileNav.tsx`) and browse Leads. | Desktop table switches automatically to `LeadCardMobile` cards; mobile drawer locks background scroll, closes on `Escape`, and interactive controls maintain $\ge 44\text{px}$ touch targets. | **PASS** |
| **TC-27** | Global React Error Boundary (`ErrorBoundary.tsx`) | Verify `<ErrorBoundary>` wraps `<App />` in `src/main.tsx`. | Uncaught runtime errors render a recovery card with **Reload Application** and **Reset Demo Cache & Reload** actions instead of a blank screen. | **PASS** |
