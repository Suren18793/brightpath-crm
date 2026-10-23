-- ==============================================================================
-- BrightPath CRM — Migration 002: Row Level Security (RLS) & Access Policies
-- Enforces role-based permissions (Counsellor vs Manager vs Admin)
-- Prevents privilege escalation and self-promotion
-- ==============================================================================

-- 1. Enable RLS on All Tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- 2. Helper Function: Safely Retrieve Current User Role
-- SECURITY DEFINER runs with creator privileges and fixed search_path to prevent search_path spoofing
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(v_role, 'counsellor');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Anti-Self-Promotion Protection
-- Ensures users cannot escalate their own role via client-side UPDATE requests
CREATE OR REPLACE FUNCTION public.prevent_self_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is modified and the current user is not an admin, reject the update
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF public.get_current_user_role() != 'admin' THEN
      RAISE EXCEPTION 'Permission denied: Only administrators can modify user roles.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_prevent_self_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_self_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_role_escalation();

-- ==============================================================================
-- PROFILES POLICIES
-- ==============================================================================

-- All authenticated users can view staff profiles (necessary for assignee dropdowns and name tags)
DROP POLICY IF EXISTS "Authenticated users can view staff profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view staff profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile details (full_name only; role change is blocked by trigger)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ==============================================================================
-- LEADS POLICIES
-- ==============================================================================

-- SELECT Policy:
-- - Admins and Managers can view all leads across the institute
-- - Counsellors can view leads they created OR are assigned to
DROP POLICY IF EXISTS "Role-based lead access" ON public.leads;
CREATE POLICY "Role-based lead access"
  ON public.leads FOR SELECT
  TO authenticated
  USING (
    public.get_current_user_role() IN ('admin', 'manager')
    OR assigned_to = auth.uid()
    OR created_by = auth.uid()
  );

-- INSERT Policy:
-- All authenticated staff can capture new student enquiries
DROP POLICY IF EXISTS "Authenticated staff can create leads" ON public.leads;
CREATE POLICY "Authenticated staff can create leads"
  ON public.leads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE Policy:
-- - Admins and Managers can update any lead
-- - Counsellors can update leads they created OR are assigned to
DROP POLICY IF EXISTS "Role-based lead updates" ON public.leads;
CREATE POLICY "Role-based lead updates"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (
    public.get_current_user_role() IN ('admin', 'manager')
    OR assigned_to = auth.uid()
    OR created_by = auth.uid()
  )
  WITH CHECK (
    public.get_current_user_role() IN ('admin', 'manager')
    OR assigned_to = auth.uid()
    OR created_by = auth.uid()
  );

-- DELETE Policy:
-- Only Admins and Managers can delete leads (prevents accidental record loss by counsellors)
DROP POLICY IF EXISTS "Managers and admins can delete leads" ON public.leads;
CREATE POLICY "Managers and admins can delete leads"
  ON public.leads FOR DELETE
  TO authenticated
  USING (public.get_current_user_role() IN ('admin', 'manager'));

-- ==============================================================================
-- FOLLOW-UPS POLICIES
-- Follow-up permissions inherit access from the underlying parent lead
-- ==============================================================================

DROP POLICY IF EXISTS "Access follow-ups of accessible leads" ON public.follow_ups;
CREATE POLICY "Access follow-ups of accessible leads"
  ON public.follow_ups FOR SELECT
  TO authenticated
  USING (
    lead_id IN (
      SELECT id FROM public.leads
    )
  );

DROP POLICY IF EXISTS "Create follow-ups for accessible leads" ON public.follow_ups;
CREATE POLICY "Create follow-ups for accessible leads"
  ON public.follow_ups FOR INSERT
  TO authenticated
  WITH CHECK (
    lead_id IN (
      SELECT id FROM public.leads
    )
  );

DROP POLICY IF EXISTS "Update follow-ups of accessible leads" ON public.follow_ups;
CREATE POLICY "Update follow-ups of accessible leads"
  ON public.follow_ups FOR UPDATE
  TO authenticated
  USING (
    lead_id IN (
      SELECT id FROM public.leads
    )
  )
  WITH CHECK (
    lead_id IN (
      SELECT id FROM public.leads
    )
  );

DROP POLICY IF EXISTS "Delete follow-ups of accessible leads" ON public.follow_ups;
CREATE POLICY "Delete follow-ups of accessible leads"
  ON public.follow_ups FOR DELETE
  TO authenticated
  USING (
    public.get_current_user_role() IN ('admin', 'manager')
    OR created_by = auth.uid()
  );

-- ==============================================================================
-- ACTIVITIES POLICIES
-- Immutable audit log: Only SELECT and INSERT allowed (no UPDATE/DELETE)
-- ==============================================================================

DROP POLICY IF EXISTS "View activities for accessible leads" ON public.activities;
CREATE POLICY "View activities for accessible leads"
  ON public.activities FOR SELECT
  TO authenticated
  USING (
    lead_id IN (
      SELECT id FROM public.leads
    )
  );

DROP POLICY IF EXISTS "Record activities for accessible leads" ON public.activities;
CREATE POLICY "Record activities for accessible leads"
  ON public.activities FOR INSERT
  TO authenticated
  WITH CHECK (
    lead_id IN (
      SELECT id FROM public.leads
    )
  );
