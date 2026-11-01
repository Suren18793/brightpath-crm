# BrightPath CRM — GitHub & Vercel Production Deployment Guide

This guide walks you step-by-step through pushing **BrightPath CRM** to GitHub and deploying a live production URL on **Vercel**.

> **Works With or Without Supabase**:
> - **Without Supabase Setup**: You can deploy to Vercel immediately with zero environment variables. The live URL will launch in **Workshop Preview Mode** (using pre-seeded demo leads & follow-ups persisted in browser `localStorage`).
> - **With Supabase Connected**: Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel Environment Variables to connect your live PostgreSQL database and Row Level Security policies.

---

## 1. Pre-Deployment Verification

Before pushing to GitHub, verify that the local TypeScript build and ESLint checks pass cleanly and no secret `.env` files are staged:

```powershell
# 1. Verify TypeScript + Vite production bundle build (must exit 0)
npm run build

# 2. Verify ESLint passes with 0 errors
npm run lint

# 3. Confirm .env is ignored by Git
git status
```

---

## 2. Push Repository to GitHub

1. Create a new repository on [GitHub](https://github.com/new) named `brightpath-crm` (leave **"Add a README"** unchecked since this repo already has a complete `README.md` and commit history).
2. Link your local repository and push the `master` branch:

```powershell
git remote add origin https://github.com/<your-github-username>/brightpath-crm.git
git branch -M main
git push -u origin main
```

*(If a remote `origin` already exists, run `git remote set-url origin https://github.com/<your-github-username>/brightpath-crm.git` and then `git push -u origin main`.)*

---

## 3. Deploy to Vercel (Step-by-Step)

### Option A: Deploy via Vercel Web Dashboard (Recommended)

1. Go to [https://vercel.com/new](https://vercel.com/new) and sign in with your GitHub account.
2. Click **Import** next to your `brightpath-crm` repository.
3. Vercel will automatically detect the settings from [`vercel.json`](file:///c:/Users/kanha/brightpath-crm/vercel.json):
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables (Optional for Workshop Mode / Required for Live Supabase)**:
   - If you have set up a Supabase project, expand **Environment Variables** and add:
     | Key | Value | Environments |
     | :--- | :--- | :--- |
     | `VITE_SUPABASE_URL` | `https://<your-project-ref>.supabase.co` | Production, Preview, Development |
     | `VITE_SUPABASE_ANON_KEY` | `<your-supabase-anon-public-key>` | Production, Preview, Development |
   - *Security Note*: Never add `service_role` keys or database passwords to Vercel frontend environment variables.
5. Click **Deploy**. Within ~45 seconds, Vercel will publish your live production URL (e.g., `https://brightpath-crm.vercel.app`).

---

### Option B: Deploy via Vercel CLI

If you prefer deploying directly from your terminal:

```powershell
# Run Vercel CLI (prompts login on first use)
npx vercel

# Deploy to production
npx vercel --prod
```

---

## 4. Supabase Auth Redirect URL Configuration (When Using Live Supabase)

Once your Vercel URL is live, add it to your Supabase project's allowed URLs so staff authentication works seamlessly in production:

1. Open [Supabase Dashboard](https://supabase.com/dashboard) $\rightarrow$ **Authentication** $\rightarrow$ **URL Configuration**.
2. Set **Site URL** to your production Vercel URL:
   ```text
   https://your-brightpath-crm.vercel.app
   ```
3. Under **Redirect URLs**, add:
   ```text
   https://your-brightpath-crm.vercel.app/**
   ```
4. Click **Save**.

---

## 5. Post-Deployment Smoke Test Checklist

After your Vercel deployment finishes, open your live production URL and verify the following 7 checks:

- [ ] **1. SPA Routing & Asset Load**: Page loads with zero console errors; refreshing the browser on the live URL serves `index.html` cleanly via [`vercel.json`](file:///c:/Users/kanha/brightpath-crm/vercel.json) rewrite rules.
- [ ] **2. Role Preview / Staff Sign-In**: Switching between `Counsellor`, `Manager`, and `Admin` (or signing in via **Sign In** modal) scopes the visible leads and KPIs immediately.
- [ ] **3. Reconciled Dashboard KPIs**: All 5 KPI cards (`Total Accessible Leads`, `New Enquiries`, `Converted Admissions`, `Overdue Follow-Ups`, `Conversion Rate %`) match the Lead List and Follow-Up counts.
- [ ] **4. Create & Edit Student Lead**: Clicking **+ New Lead** $\rightarrow$ **Fill Sample Student** $\rightarrow$ **Create Lead** adds the student to the pipeline and increments the KPI counters.
- [ ] **5. Mandatory Lost Reason Gate**: Changing a lead's status to `Lost` opens the **Lost Reason Modal** and requires a reason before saving.
- [ ] **6. Follow-Up Scheduling & 1-Click Completion**: Scheduling a follow-up and clicking **Mark Completed** updates the overdue badge and logs an entry in the student's **360° Lead Detail Drawer** timeline.
- [ ] **7. Sanitized CSV Export**: Clicking **Export Leads CSV** in **Reports** or **Leads** downloads a clean, UTF-8 BOM `.csv` file.
