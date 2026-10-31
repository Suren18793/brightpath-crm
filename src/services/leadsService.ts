import { supabase, configStatus } from '../lib/supabaseClient'
import type {
  Lead,
  LeadFilterState,
  LeadStats,
  LeadStatus,
  LeadSource,
  CreateLeadInput,
  UpdateLeadInput,
} from '../types/leads'
import type { UserRole } from '../types/auth'

const STORAGE_KEY = 'brightpath_crm_mock_leads'

export const SEED_LEADS: Lead[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    full_name: 'Ananya Deshmukh',
    email: 'ananya.d@example.com',
    phone: '+91 98201 12345',
    course_interest: 'JEE Advanced Masterclass',
    source: 'Website',
    status: 'New',
    lost_reason: null,
    assigned_to: 'demo-counsellor-001',
    assignee_name: 'Priya Sharma',
    created_by: 'demo-counsellor-001',
    notes: 'Parent enquired via website form regarding weekend classroom batch timings and syllabus structure.',
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    next_followup_due: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    next_followup_status: 'pending',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    full_name: 'Karan Mehta',
    email: 'karan.m@example.com',
    phone: '+91 98190 23456',
    course_interest: 'NEET Comprehensive',
    source: 'Phone Call',
    status: 'Contacted',
    lost_reason: null,
    assigned_to: 'demo-counsellor-001',
    assignee_name: 'Priya Sharma',
    created_by: 'demo-counsellor-001',
    notes: 'Spoke with student. Interested in medical entrance program. Requested fee brochure and scholarship criteria.',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    next_followup_due: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // Overdue
    next_followup_status: 'pending',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    full_name: 'Sneha Kulkarni',
    email: 'sneha.k@example.com',
    phone: '+91 99302 45678',
    course_interest: 'Full Stack Web Dev',
    source: 'WhatsApp',
    status: 'Contacted',
    lost_reason: null,
    assigned_to: 'demo-manager-002',
    assignee_name: 'Aarav Patel',
    created_by: 'demo-manager-002',
    notes: 'Working professional looking for evening batches in MERN stack. Sent course curriculum on WhatsApp.',
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    next_followup_due: new Date(Date.now() + 4 * 3600 * 1000).toISOString(), // Today
    next_followup_status: 'pending',
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    full_name: 'Tanvi Sen',
    email: 'tanvi.sen@example.com',
    phone: '+91 98450 67890',
    course_interest: 'JEE Advanced Masterclass',
    source: 'Walk-in',
    status: 'Qualified',
    lost_reason: null,
    assigned_to: 'demo-counsellor-001',
    assignee_name: 'Priya Sharma',
    created_by: 'demo-counsellor-001',
    notes: 'Visited campus with father. Highly motivated, scored 94% in Class 10 boards. Scheduled counseling session.',
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    next_followup_due: new Date(Date.now() + 28 * 3600 * 1000).toISOString(), // Tomorrow
    next_followup_status: 'pending',
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    full_name: 'Vikram Rajput',
    email: 'vikram.r@example.com',
    phone: '+91 97110 33445',
    course_interest: 'NEET Comprehensive',
    source: 'Referral',
    status: 'Converted',
    lost_reason: null,
    assigned_to: 'demo-manager-002',
    assignee_name: 'Aarav Patel',
    created_by: 'demo-manager-002',
    notes: 'Admission fee confirmed. Assigned to batch A1 commencing next Monday. Welcome kit issued.',
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    next_followup_due: null,
    next_followup_status: null,
  },
  {
    id: '66666666-6666-4666-8666-666666666666',
    full_name: 'Sameer Joshi',
    email: 'sameer.j@example.com',
    phone: '+91 98223 99881',
    course_interest: 'Full Stack Web Dev',
    source: 'Phone Call',
    status: 'Lost',
    lost_reason: 'Enrolled in a competitor program offering 100% remote job guarantee.',
    assigned_to: 'demo-counsellor-001',
    assignee_name: 'Priya Sharma',
    created_by: 'demo-counsellor-001',
    notes: 'Compared multiple bootcamp curricula. Preferred shorter 3-month track.',
    created_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    next_followup_due: null,
    next_followup_status: null,
  },
  {
    id: '77777777-7777-4777-8777-777777777777',
    full_name: 'Rohan Verma',
    email: 'rohan.v@example.com',
    phone: '+91 98765 43210',
    course_interest: 'NEET Comprehensive',
    source: 'Website',
    status: 'New',
    lost_reason: null,
    assigned_to: 'demo-manager-002',
    assignee_name: 'Aarav Patel',
    created_by: 'demo-manager-002',
    notes: 'Submitted online callback request regarding scholarship tests.',
    created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    next_followup_due: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
    next_followup_status: 'pending',
  },
]

export interface FetchLeadsResult {
  leads: Lead[]
  isDemoFallback: boolean
  schemaMissingNotice?: boolean
  error?: string | null
}

export const leadsService = {
  /**
   * Retrieves persistent mock leads from LocalStorage or seeds initial dataset
   */
  getStoredMockLeads(): Lead[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored) as Lead[]
      }
    } catch (e) {
      console.warn('[leadsService] Failed to load local leads cache:', e)
    }
    // Initialize default seeds
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_LEADS))
    return SEED_LEADS
  },

  /**
   * Saves updated mock leads into LocalStorage
   */
  saveStoredMockLeads(leads: Lead[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads))
    } catch (e) {
      console.warn('[leadsService] Failed to save mock leads:', e)
    }
  },

  /**
   * Fetch leads with role-based scoping and live search/filter criteria.
   * Seamlessly checks Supabase; if tables are not migrated yet (PGRST205),
   * falls back safely to local seed data.
   */
  async getLeads(
    filters: LeadFilterState,
    userRole: UserRole = 'counsellor',
    currentUserId?: string | null
  ): Promise<FetchLeadsResult> {
    // 1. Attempt live Supabase fetch if configured
    if (configStatus.isConfigured) {
      try {
        let query = supabase
          .from('leads')
          .select(`
            *,
            assignee:profiles!leads_assigned_to_fkey(id, full_name),
            follow_ups(due_at, status)
          `)

        // Role-based visibility enforcement for counsellors
        if (userRole === 'counsellor' && currentUserId) {
          query = query.eq('assigned_to', currentUserId)
        }

        // Apply Status Filter
        if (filters.status !== 'all') {
          query = query.eq('status', filters.status)
        }

        // Apply Source Filter
        if (filters.source !== 'all') {
          query = query.eq('source', filters.source)
        }

        // Apply Assignee Filter (if not already restricted by counsellor role)
        if (filters.assignedTo !== 'all' && userRole !== 'counsellor') {
          query = query.eq('assigned_to', filters.assignedTo)
        }

        // Apply Order
        query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' })

        const { data, error } = await query

        if (!error && data) {
          // If in workshop preview mode without a signed-in Supabase session and RLS returns 0 rows,
          // gracefully fallback to local demo leads so preview mode remains fully testable
          if (data.length === 0 && !currentUserId) {
            return this.queryMockLeads(filters, userRole, currentUserId, false)
          }

          // Format records from joined relation
          let leads: Lead[] = data.map((item: any) => {
            const nextFollowup = item.follow_ups?.find((f: any) => f.status === 'pending')
            return {
              id: item.id,
              full_name: item.full_name,
              email: item.email,
              phone: item.phone,
              course_interest: item.course_interest,
              source: item.source as LeadSource,
              status: item.status as LeadStatus,
              lost_reason: item.lost_reason,
              assigned_to: item.assigned_to,
              created_by: item.created_by,
              notes: item.notes,
              created_at: item.created_at,
              updated_at: item.updated_at,
              assignee_name: item.assignee?.full_name || 'Unassigned',
              next_followup_due: nextFollowup?.due_at || null,
              next_followup_status: nextFollowup?.status || null,
            }
          })

          // Apply client-side full-text search across student name, email, phone, and course
          if (filters.searchQuery.trim()) {
            const term = filters.searchQuery.toLowerCase().trim()
            leads = leads.filter(
              (l) =>
                l.full_name.toLowerCase().includes(term) ||
                (l.email && l.email.toLowerCase().includes(term)) ||
                l.phone.toLowerCase().includes(term) ||
                l.course_interest.toLowerCase().includes(term)
            )
          }

          return {
            leads,
            isDemoFallback: false,
          }
        }

        // Check if error is due to missing tables (PGRST205)
        const isTableMissing =
          error && (error.code === 'PGRST205' || error.message.includes('Could not find the table'))

        if (isTableMissing) {
          console.info(
            '[leadsService] Supabase project connected, but database tables are not yet created. Using demo dataset.'
          )
          return this.queryMockLeads(filters, userRole, currentUserId, true)
        }

        console.warn('[leadsService] Supabase query returned error, falling back to mock:', error?.message)
      } catch (err) {
        console.warn('[leadsService] Network or Supabase exception, using demo fallback:', err)
      }
    }

    // 2. Fallback to LocalStorage Mock Data
    return this.queryMockLeads(filters, userRole, currentUserId, false)
  },

  /**
   * Internal query engine for mock/demo dataset
   */
  queryMockLeads(
    filters: LeadFilterState,
    userRole: UserRole,
    currentUserId?: string | null,
    schemaMissingNotice = false
  ): FetchLeadsResult {
    let list = this.getStoredMockLeads()

    // Scoping for Counsellor role:
    // If previewing as Counsellor (Priya Sharma), show leads assigned to Priya Sharma or demo counsellor
    if (userRole === 'counsellor') {
      list = list.filter(
        (lead) =>
          lead.assigned_to === 'demo-counsellor-001' ||
          lead.assignee_name?.toLowerCase().includes('priya') ||
          (currentUserId && lead.assigned_to === currentUserId)
      )
    }

    // Apply Status Filter
    if (filters.status !== 'all') {
      list = list.filter((l) => l.status === filters.status)
    }

    // Apply Source Filter
    if (filters.source !== 'all') {
      list = list.filter((l) => l.source === filters.source)
    }

    // Apply Assignee Filter
    if (filters.assignedTo !== 'all' && userRole !== 'counsellor') {
      list = list.filter((l) => l.assigned_to === filters.assignedTo)
    }

    // Apply Real-Time Search Query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim()
      list = list.filter(
        (l) =>
          l.full_name.toLowerCase().includes(q) ||
          (l.email && l.email.toLowerCase().includes(q)) ||
          l.phone.toLowerCase().includes(q) ||
          l.course_interest.toLowerCase().includes(q)
      )
    }

    // Apply Sorting
    list = [...list].sort((a, b) => {
      let cmp = 0
      if (filters.sortBy === 'full_name') {
        cmp = a.full_name.localeCompare(b.full_name)
      } else if (filters.sortBy === 'status') {
        cmp = a.status.localeCompare(b.status)
      } else {
        cmp = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      return filters.sortOrder === 'asc' ? cmp : -cmp
    })

    return {
      leads: list,
      isDemoFallback: true,
      schemaMissingNotice,
    }
  },

  /**
   * Get list of staff members / counsellors for filter dropdown
   */
  async getCounsellors(): Promise<{ id: string; full_name: string }[]> {
    if (configStatus.isConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('role', ['counsellor', 'manager'])
        if (!error && data && data.length > 0) {
          return data
        }
      } catch (err) {
        // Ignore and fallback
      }
    }

    // Demo Presets
    return [
      { id: 'demo-counsellor-001', full_name: 'Priya Sharma (Counsellor)' },
      { id: 'demo-manager-002', full_name: 'Aarav Patel (Manager)' },
      { id: 'demo-admin-003', full_name: 'Dr. Ramesh Nair (Director)' },
    ]
  },

  /**
   * Compute aggregated statistics from lead array
   */
  getLeadStats(leads: Lead[]): LeadStats {
    const stats: LeadStats = {
      total: leads.length,
      newCount: 0,
      contactedCount: 0,
      qualifiedCount: 0,
      convertedCount: 0,
      lostCount: 0,
    }

    for (const lead of leads) {
      switch (lead.status) {
        case 'New':
          stats.newCount++
          break
        case 'Contacted':
          stats.contactedCount++
          break
        case 'Qualified':
          stats.qualifiedCount++
          break
        case 'Converted':
          stats.convertedCount++
          break
        case 'Lost':
          stats.lostCount++
          break
      }
    }

    return stats
  },

  /**
   * Create a new student lead with dual-mode Supabase/LocalStorage persistence
   */
  async createLead(
    input: CreateLeadInput,
    currentUserId?: string | null,
    userRole?: UserRole
  ): Promise<Lead> {
    const trimmedName = input.full_name.trim()
    const trimmedPhone = input.phone.trim()
    const trimmedEmail = input.email?.trim() || null
    const effectiveStatus: LeadStatus = input.status || 'New'

    // Determine assignee
    let assignedTo = input.assigned_to || null
    if (!assignedTo && userRole === 'counsellor' && currentUserId) {
      assignedTo = currentUserId
    }

    // 1. Live Supabase Insert
    if (configStatus.isConfigured && currentUserId) {
      try {
        const { data, error } = await supabase
          .from('leads')
          .insert({
            full_name: trimmedName,
            phone: trimmedPhone,
            email: trimmedEmail,
            course_interest: input.course_interest,
            source: input.source,
            status: effectiveStatus,
            assigned_to: assignedTo,
            created_by: currentUserId,
            notes: input.notes?.trim() || null,
          })
          .select(`
            *,
            assignee:profiles!leads_assigned_to_fkey(id, full_name)
          `)
          .single()

        if (!error && data) {
          return {
            id: data.id,
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            course_interest: data.course_interest,
            source: data.source as LeadSource,
            status: data.status as LeadStatus,
            lost_reason: data.lost_reason,
            assigned_to: data.assigned_to,
            created_by: data.created_by,
            notes: data.notes,
            created_at: data.created_at,
            updated_at: data.updated_at,
            assignee_name: data.assignee?.full_name || 'Unassigned',
            next_followup_due: null,
            next_followup_status: null,
          }
        }
        console.warn('[leadsService] Supabase lead creation error, falling back to local store:', error?.message)
      } catch (err) {
        console.warn('[leadsService] Supabase insert exception, falling back to local store:', err)
      }
    }

    // 2. LocalStorage Fallback (Workshop Preview Mode)
    const counsellors = await this.getCounsellors()
    const assigneeMatch = counsellors.find((c) => c.id === assignedTo)
    const fallbackAssigneeName =
      assigneeMatch?.full_name.split(' (')[0] || (userRole === 'counsellor' ? 'Priya Sharma' : 'Unassigned')

    const newLead: Lead = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `mock-${Date.now()}`,
      full_name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      course_interest: input.course_interest,
      source: input.source,
      status: effectiveStatus,
      lost_reason: null,
      assigned_to: assignedTo || (userRole === 'counsellor' ? 'demo-counsellor-001' : null),
      created_by: currentUserId || 'demo-counsellor-001',
      notes: input.notes?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assignee_name: fallbackAssigneeName,
      next_followup_due: null,
      next_followup_status: null,
    }

    const currentLeads = this.getStoredMockLeads()
    const updatedList = [newLead, ...currentLeads]
    this.saveStoredMockLeads(updatedList)

    return newLead
  },

  /**
   * Update an existing lead record
   */
  async updateLead(id: string, updates: UpdateLeadInput): Promise<Lead> {
    // 1. Live Supabase Update
    if (configStatus.isConfigured) {
      try {
        const updatePayload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        }

        if (updates.full_name !== undefined) updatePayload.full_name = updates.full_name.trim()
        if (updates.email !== undefined) updatePayload.email = updates.email?.trim() || null
        if (updates.phone !== undefined) updatePayload.phone = updates.phone.trim()
        if (updates.course_interest !== undefined) updatePayload.course_interest = updates.course_interest
        if (updates.source !== undefined) updatePayload.source = updates.source
        if (updates.status !== undefined) updatePayload.status = updates.status
        if (updates.lost_reason !== undefined) updatePayload.lost_reason = updates.lost_reason
        if (updates.assigned_to !== undefined) updatePayload.assigned_to = updates.assigned_to
        if (updates.notes !== undefined) updatePayload.notes = updates.notes?.trim() || null

        const { data, error } = await supabase
          .from('leads')
          .update(updatePayload)
          .eq('id', id)
          .select(`
            *,
            assignee:profiles!leads_assigned_to_fkey(id, full_name)
          `)
          .single()

        if (!error && data) {
          return {
            id: data.id,
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            course_interest: data.course_interest,
            source: data.source as LeadSource,
            status: data.status as LeadStatus,
            lost_reason: data.lost_reason,
            assigned_to: data.assigned_to,
            created_by: data.created_by,
            notes: data.notes,
            created_at: data.created_at,
            updated_at: data.updated_at,
            assignee_name: data.assignee?.full_name || 'Unassigned',
          }
        }
      } catch (err) {
        console.warn('[leadsService] Supabase update exception, updating local store:', err)
      }
    }

    // 2. LocalStorage Fallback
    const currentLeads = this.getStoredMockLeads()
    const index = currentLeads.findIndex((l) => l.id === id)
    if (index === -1) {
      throw new Error(`Lead with id ${id} not found`)
    }

    const counsellors = await this.getCounsellors()
    let assigneeName = currentLeads[index].assignee_name
    if (updates.assigned_to !== undefined) {
      const match = counsellors.find((c) => c.id === updates.assigned_to)
      assigneeName = match?.full_name.split(' (')[0] || 'Unassigned'
    }

    const updatedLead: Lead = {
      ...currentLeads[index],
      ...updates,
      assignee_name: assigneeName,
      updated_at: new Date().toISOString(),
    }

    currentLeads[index] = updatedLead
    this.saveStoredMockLeads(currentLeads)
    return updatedLead
  },
}
