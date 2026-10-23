-- ==============================================================================
-- BrightPath CRM — Migration 003: Dynamic Demo Seed Data
-- Fictional Coaching Institute: BrightPath Academy
-- Dynamic relative timestamps: NOW() +/- INTERVAL ensures realistic overdue/upcoming states
-- Safe execution: Works whether or not auth users exist yet
-- ==============================================================================

DO $$
DECLARE
  v_staff_id UUID;
  v_lead_1 UUID := gen_random_uuid();
  v_lead_2 UUID := gen_random_uuid();
  v_lead_3 UUID := gen_random_uuid();
  v_lead_4 UUID := gen_random_uuid();
  v_lead_5 UUID := gen_random_uuid();
  v_lead_6 UUID := gen_random_uuid();
  v_lead_7 UUID := gen_random_uuid();
  v_lead_8 UUID := gen_random_uuid();
BEGIN
  -- Grab the first existing profile ID if any user has signed up, otherwise NULL
  SELECT id INTO v_staff_id FROM public.profiles LIMIT 1;

  -- ============================================================================
  -- 1. SEED LEADS
  -- ============================================================================

  -- Lead 1: New enquiry via Website (JEE Masterclass)
  INSERT INTO public.leads (id, full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes, created_at)
  VALUES (
    v_lead_1,
    'Ananya Deshmukh',
    'ananya.d@example.com',
    '+91 98201 12345',
    'JEE Advanced Masterclass',
    'Website',
    'New',
    v_staff_id,
    v_staff_id,
    'Parent enquired via website form regarding weekend classroom batch timings and syllabus structure.',
    NOW() - INTERVAL '4 hours'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Lead 2: Contacted lead (NEET Comprehensive) — OVERDUE FOLLOW-UP ATTACHED
  INSERT INTO public.leads (id, full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes, created_at)
  VALUES (
    v_lead_2,
    'Karan Mehta',
    'karan.m@example.com',
    '+91 98190 23456',
    'NEET Comprehensive',
    'Phone Call',
    'Contacted',
    v_staff_id,
    v_staff_id,
    'Spoke with student. Interested in medical entrance program. Requested fee brochure and scholarship criteria.',
    NOW() - INTERVAL '1 day'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Lead 3: Contacted lead (Full Stack Web Dev) — DUE TODAY FOLLOW-UP ATTACHED
  INSERT INTO public.leads (id, full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes, created_at)
  VALUES (
    v_lead_3,
    'Sneha Kulkarni',
    'sneha.k@example.com',
    '+91 99302 45678',
    'Full Stack Web Dev',
    'WhatsApp',
    'Contacted',
    v_staff_id,
    v_staff_id,
    'Working professional looking for evening batches in MERN stack. Sent course curriculum on WhatsApp.',
    NOW() - INTERVAL '2 days'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Lead 4: Qualified lead (JEE Advanced) — UPCOMING FOLLOW-UP ATTACHED
  INSERT INTO public.leads (id, full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes, created_at)
  VALUES (
    v_lead_4,
    'Tanvi Sen',
    'tanvi.sen@example.com',
    '+91 98450 67890',
    'JEE Advanced Masterclass',
    'Walk-in',
    'Qualified',
    v_staff_id,
    v_staff_id,
    'Visited campus with father. Highly motivated, scored 94% in Class 10 boards. Scheduled counseling session.',
    NOW() - INTERVAL '3 days'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Lead 5: Converted lead (NEET Comprehensive) — ADMITTED
  INSERT INTO public.leads (id, full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes, created_at)
  VALUES (
    v_lead_5,
    'Vikram Rajput',
    'vikram.r@example.com',
    '+91 97110 33445',
    'NEET Comprehensive',
    'Referral',
    'Converted',
    v_staff_id,
    v_staff_id,
    'Admission fee confirmed. Assigned to batch A1 commencing next Monday. Welcome kit issued.',
    NOW() - INTERVAL '5 days'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Lead 6: Lost lead (UI/UX Design) — WITH MANDATORY LOST REASON
  INSERT INTO public.leads (id, full_name, email, phone, course_interest, source, status, lost_reason, assigned_to, created_by, notes, created_at)
  VALUES (
    v_lead_6,
    'Sameer Joshi',
    'sameer.j@example.com',
    '+91 98223 99881',
    'UI/UX Design',
    'Phone Call',
    'Lost',
    'Location/Timings Incompatible',
    v_staff_id,
    v_staff_id,
    'Student needed weekend-only offline classes in Pune center. Our center currently offers weekday evening slots only.',
    NOW() - INTERVAL '6 days'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Lead 7: Qualified lead (Data Science)
  INSERT INTO public.leads (id, full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes, created_at)
  VALUES (
    v_lead_7,
    'Rahul Nambiar',
    'rahul.n@example.com',
    '+91 98860 11223',
    'Data Science & AI',
    'Website',
    'Qualified',
    v_staff_id,
    v_staff_id,
    'B.Tech graduate seeking placement assistance program. Demo lecture attended with positive feedback.',
    NOW() - INTERVAL '7 days'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Lead 8: Converted lead (Full Stack Web Dev)
  INSERT INTO public.leads (id, full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes, created_at)
  VALUES (
    v_lead_8,
    'Pooja Nair',
    'pooja.n@example.com',
    '+91 98765 43210',
    'Full Stack Web Dev',
    'Walk-in',
    'Converted',
    v_staff_id,
    v_staff_id,
    'Enrolled and initial deposit received. Software licenses and lab access credentials dispatched.',
    NOW() - INTERVAL '8 days'
  )
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- 2. SEED FOLLOW-UPS (With Dynamic Relative Due Dates)
  -- ============================================================================

  -- Follow-up 1: OVERDUE (Due 3 hours ago)
  INSERT INTO public.follow_ups (lead_id, assigned_to, due_at, note, status, created_by, created_at)
  VALUES (
    v_lead_2,
    v_staff_id,
    NOW() - INTERVAL '3 hours',
    'Call Karan Mehta to discuss NEET morning batch scholarship eligibility and hostel options.',
    'pending',
    v_staff_id,
    NOW() - INTERVAL '1 day'
  );

  -- Follow-up 2: OVERDUE (Due 1 day ago)
  INSERT INTO public.follow_ups (lead_id, assigned_to, due_at, note, status, created_by, created_at)
  VALUES (
    v_lead_1,
    v_staff_id,
    NOW() - INTERVAL '1 day',
    'Initial enquiry follow-up: Send JEE syllabus and schedule counseling zoom call with parents.',
    'pending',
    v_staff_id,
    NOW() - INTERVAL '2 days'
  );

  -- Follow-up 3: DUE TODAY (Due in 2 hours)
  INSERT INTO public.follow_ups (lead_id, assigned_to, due_at, note, status, created_by, created_at)
  VALUES (
    v_lead_3,
    v_staff_id,
    NOW() + INTERVAL '2 hours',
    'Follow up on WhatsApp with Sneha regarding weekend lab access for Full Stack Web Dev.',
    'pending',
    v_staff_id,
    NOW() - INTERVAL '1 day'
  );

  -- Follow-up 4: UPCOMING (Due in 2 days)
  INSERT INTO public.follow_ups (lead_id, assigned_to, due_at, note, status, created_by, created_at)
  VALUES (
    v_lead_4,
    v_staff_id,
    NOW() + INTERVAL '2 days',
    'Schedule personal counseling session with Academic Director for Tanvi Sen.',
    'pending',
    v_staff_id,
    NOW() - INTERVAL '1 day'
  );

  -- Follow-up 5: COMPLETED
  INSERT INTO public.follow_ups (lead_id, assigned_to, due_at, note, status, completed_at, created_by, created_at)
  VALUES (
    v_lead_5,
    v_staff_id,
    NOW() - INTERVAL '2 days',
    'Confirm receipt of admission fee receipt and verify student email address.',
    'completed',
    NOW() - INTERVAL '4 hours',
    v_staff_id,
    NOW() - INTERVAL '3 days'
  );

  -- ============================================================================
  -- 3. SEED ACTIVITY HISTORY
  -- ============================================================================

  INSERT INTO public.activities (lead_id, actor_id, activity_type, description, metadata, created_at)
  VALUES 
    (v_lead_1, v_staff_id, 'created', 'Lead created via Website enquiry', '{"source": "Website"}'::JSONB, NOW() - INTERVAL '4 hours'),
    (v_lead_2, v_staff_id, 'created', 'Lead captured via inbound Phone Call', '{"source": "Phone Call"}'::JSONB, NOW() - INTERVAL '1 day'),
    (v_lead_2, v_staff_id, 'status_changed', 'Status changed from New to Contacted', '{"from": "New", "to": "Contacted"}'::JSONB, NOW() - INTERVAL '20 hours'),
    (v_lead_2, v_staff_id, 'followup_added', 'Follow-up call scheduled for batch timings discussion', '{"due_at": "past"}'::JSONB, NOW() - INTERVAL '18 hours'),
    (v_lead_4, v_staff_id, 'created', 'Walk-in enquiry registered at front desk', '{"source": "Walk-in"}'::JSONB, NOW() - INTERVAL '3 days'),
    (v_lead_4, v_staff_id, 'status_changed', 'Status progressed to Qualified after counselor evaluation', '{"from": "Contacted", "to": "Qualified"}'::JSONB, NOW() - INTERVAL '2 days'),
    (v_lead_5, v_staff_id, 'status_changed', 'Student officially Converted (Admissions fee cleared)', '{"from": "Qualified", "to": "Converted"}'::JSONB, NOW() - INTERVAL '1 day'),
    (v_lead_6, v_staff_id, 'status_changed', 'Lead marked Lost. Reason: Location/Timings Incompatible', '{"from": "Contacted", "to": "Lost", "reason": "Location/Timings Incompatible"}'::JSONB, NOW() - INTERVAL '6 days');

END $$;
