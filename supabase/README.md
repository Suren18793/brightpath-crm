# BrightPath CRM — Database & Supabase Setup Guide

This guide walks you through setting up your Supabase project, executing migrations, configuring Row Level Security (RLS), and seeding realistic demo records for BrightPath Academy.

---

## Step 1: Create Your Supabase Project

1. Navigate to [https://supabase.com](https://supabase.com) and sign in or create a free account.
2. Click **New project** from your organization dashboard.
3. Choose your project settings:
   - **Name**: `brightpath-crm` (or any name you prefer)
   - **Database Password**: Set a strong password (save this in a secure password manager)
   - **Region**: Choose a region closest to you (e.g., `Central India (Mumbai)` or `South Asia (Singapore)`)
   - **Pricing Plan**: Free Tier
4. Click **Create new project** and wait 1–2 minutes while Supabase provisions your PostgreSQL database.

---

## Step 2: Retrieve API Keys & Configure Local `.env`

1. In your Supabase dashboard, click the **Settings (gear icon)** at the bottom of the left sidebar.
2. Select **API** under Configuration.
3. Locate the following two values:
   - **Project URL**: (e.g., `https://abcdefghijkl.supabase.co`)
   - **Project API Keys**: Copy the **`anon` `public`** key (starts with `eyJ...`).
   *(⚠️ Never use or copy the `service_role` secret key into your frontend)*.
4. In your local project root (`brightpath-crm/`), copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
5. Paste your URL and anon key into `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```

---

## Step 3: Execute Database Migrations

You can run the migration scripts directly in the **Supabase Dashboard SQL Editor**:

1. In your Supabase dashboard, click **SQL Editor** (icon with `>_`) on the left navigation bar.
2. Click **New query**.

### 3.1 Run Schema Migration (`001_initial_schema.sql`)
- Open [supabase/migrations/001_initial_schema.sql](file:///c:/Users/kanha/brightpath-crm/supabase/migrations/001_initial_schema.sql) in your code editor.
- Copy the entire SQL content, paste it into the Supabase SQL Editor query window, and click **Run** (or press `Ctrl+Enter`).
- **Outcome**: Creates `profiles`, `leads`, `follow_ups`, and `activities` tables, foreign key constraints, indexes, and automated `updated_at` triggers.

### 3.2 Run RLS Security Migration (`002_rls_policies.sql`)
- Open [supabase/migrations/002_rls_policies.sql](file:///c:/Users/kanha/brightpath-crm/supabase/migrations/002_rls_policies.sql).
- Copy the content, paste it into a new query window in Supabase SQL Editor, and click **Run**.
- **Outcome**: Enables Row Level Security on all four tables, enforces role-based access rules (Counsellor vs Manager vs Admin), and activates the anti-self-promotion trigger.

### 3.3 Run Demo Seed Data (`003_demo_seed.sql`)
- Open [supabase/migrations/003_demo_seed.sql](file:///c:/Users/kanha/brightpath-crm/supabase/migrations/003_demo_seed.sql).
- Copy the content, paste it into the SQL Editor, and click **Run**.
- **Outcome**: Seeds realistic coaching institute student enquiries, dynamic overdue and upcoming follow-ups, and activity history records.

---

## Step 4: Bootstrapping an Administrator User

By default, any new user who signs up through the app receives the least-privileged role: `'counsellor'`.

To elevate an account to `'admin'` or `'manager'`:
1. Register your user in the app (or in Supabase under *Authentication > Users*).
2. Open the Supabase **SQL Editor** and run:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE id = (
     SELECT id FROM auth.users WHERE email = 'your-email@example.com'
   );
   ```
3. Refresh the application; the top header and sidebar will now recognize the user as an **Administrator**.

---

## Step 5: Safe Database Reset (For Workshops)

If you ever need to clean your workshop database and restart from a fresh state, run this in the Supabase SQL Editor:

```sql
TRUNCATE TABLE public.activities, public.follow_ups, public.leads CASCADE;
```
Then re-run `003_demo_seed.sql` to re-populate sample data.
