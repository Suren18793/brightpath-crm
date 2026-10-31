import { supabase, configStatus } from '../lib/supabaseClient'
import { leadsService } from './leadsService'
import { activitiesService } from './activitiesService'
import {
  computeFollowUpUrgency,
  type FollowUpRecord,
  type FollowUpStatus,
  type CreateFollowUpInput,
  type FollowUpStats,
} from '../types/followups'
import type { UserRole } from '../types/auth'
import type { LeadStatus } from '../types/leads'

const FOLLOWUPS_STORAGE_KEY = 'brightpath_crm_mock_followups'

export const SEED_FOLLOWUPS: FollowUpRecord[] = [
  {
    id: 'fup-2222-01',
    lead_id: '22222222-2222-4222-8222-222222222222',
    assigned_to: 'demo-counsellor-001',
    due_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // 3 hours overdue
    note: 'Call Karan Mehta & parent to discuss NEET morning batch scholarship eligibility and hostel options.',
    status: 'pending',
    completed_at: null,
    created_by: 'demo-counsellor-001',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    lead_name: 'Karan Mehta',
    lead_phone: '+91 98190 23456',
    lead_course: 'NEET Comprehensive',
    lead_status: 'Contacted',
    assignee_name: 'Priya Sharma',
  },
  {
    id: 'fup-1111-01',
    lead_id: '11111111-1111-4111-8111-111111111111',
    assigned_to: 'demo-counsellor-001',
    due_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 1.5 hours overdue
    note: 'Initial enquiry callback: Share JEE Advanced weekend classroom batch schedule and diagnostic test link.',
    status: 'pending',
    completed_at: null,
    created_by: 'demo-counsellor-001',
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    lead_name: 'Ananya Deshmukh',
    lead_phone: '+91 98201 12345',
    lead_course: 'JEE Advanced Masterclass',
    lead_status: 'New',
    assignee_name: 'Priya Sharma',
  },
  {
    id: 'fup-3333-01',
    lead_id: '33333333-3333-4333-8333-333333333333',
    assigned_to: 'demo-manager-002',
    due_at: new Date(Date.now() + 3 * 3600 * 1000).toISOString(), // Due Today (in 3 hours)
    note: 'Follow up on WhatsApp with Sneha regarding evening MERN stack capstone projects and placement support.',
    status: 'pending',
    completed_at: null,
    created_by: 'demo-manager-002',
    created_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    lead_name: 'Sneha Kulkarni',
    lead_phone: '+91 99302 45678',
    lead_course: 'Full Stack Web Dev',
    lead_status: 'Contacted',
    assignee_name: 'Aarav Patel',
  },
  {
    id: 'fup-4444-01',
    lead_id: '44444444-4444-4444-8444-444444444444',
    assigned_to: 'demo-counsellor-001',
    due_at: new Date(Date.now() + 28 * 3600 * 1000).toISOString(), // Upcoming (Tomorrow)
    note: 'Confirm 1-on-1 academic counseling session with Academic Director and father for JEE scholarship tier.',
    status: 'pending',
    completed_at: null,
    created_by: 'demo-counsellor-001',
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    lead_name: 'Tanvi Sen',
    lead_phone: '+91 98450 67890',
    lead_course: 'JEE Advanced Masterclass',
    lead_status: 'Qualified',
    assignee_name: 'Priya Sharma',
  },
  {
    id: 'fup-7777-01',
    lead_id: '77777777-7777-4777-8777-777777777777',
    assigned_to: 'demo-manager-002',
    due_at: new Date(Date.now() + 48 * 3600 * 1000).toISOString(), // Upcoming (In 2 days)
    note: 'Check if Rohan completed the online NEET mock scholarship registration form.',
    status: 'pending',
    completed_at: null,
    created_by: 'demo-manager-002',
    created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    lead_name: 'Rohan Verma',
    lead_phone: '+91 98765 43210',
    lead_course: 'NEET Comprehensive',
    lead_status: 'New',
    assignee_name: 'Aarav Patel',
  },
  {
    id: 'fup-5555-01',
    lead_id: '55555555-5555-4555-8555-555555555555',
    assigned_to: 'demo-manager-002',
    due_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    note: 'Verify admission fee receipt and dispatch Batch A1 student welcome kit.',
    status: 'completed',
    completed_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    created_by: 'demo-manager-002',
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    lead_name: 'Vikram Rajput',
    lead_phone: '+91 97110 33445',
    lead_course: 'NEET Comprehensive',
    lead_status: 'Converted',
    assignee_name: 'Aarav Patel',
  },
]

export interface FetchFollowUpsResult {
  followUps: FollowUpRecord[]
  isDemoFallback: boolean
}

export const followUpsService = {
  /**
   * Load mock follow-ups from LocalStorage and enrich with latest local lead details
   */
  getStoredMockFollowUps(): FollowUpRecord[] {
    let list: FollowUpRecord[] = SEED_FOLLOWUPS
    try {
      const raw = localStorage.getItem(FOLLOWUPS_STORAGE_KEY)
      if (raw) {
        list = JSON.parse(raw) as FollowUpRecord[]
      } else {
        localStorage.setItem(FOLLOWUPS_STORAGE_KEY, JSON.stringify(SEED_FOLLOWUPS))
      }
    } catch (err) {
      console.warn('[followUpsService] Failed to load local follow-ups:', err)
    }

    // Reconcile lead names/courses/statuses with current stored leads
    const leads = leadsService.getStoredMockLeads()
    const leadMap = new Map(leads.map((l) => [l.id, l]))

    return list.map((item) => {
      const parent = leadMap.get(item.lead_id)
      if (!parent) return item
      return {
        ...item,
        lead_name: parent.full_name,
        lead_phone: parent.phone,
        lead_course: parent.course_interest,
        lead_status: parent.status,
      }
    })
  },

  /**
   * Persist mock follow-ups to LocalStorage and sync parent lead's next_followup_due
   */
  saveStoredMockFollowUps(followUps: FollowUpRecord[]): void {
    try {
      localStorage.setItem(FOLLOWUPS_STORAGE_KEY, JSON.stringify(followUps))

      // Reconcile next_followup_due on local mock leads so LeadTable stays 100% in sync
      const leads = leadsService.getStoredMockLeads()
      const updatedLeads = leads.map((lead) => {
        const pendingForLead = followUps
          .filter((f) => f.lead_id === lead.id && f.status === 'pending')
          .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())

        const earliestPending = pendingForLead[0]
        return {
          ...lead,
          next_followup_due: earliestPending ? earliestPending.due_at : null,
          next_followup_status: earliestPending ? ('pending' as const) : null,
        }
      })
      leadsService.saveStoredMockLeads(updatedLeads)
    } catch (err) {
      console.warn('[followUpsService] Failed to save local follow-ups:', err)
    }
  },

  /**
   * Fetch all accessible follow-ups scoped by role
   */
  async getFollowUps(
    userRole: UserRole = 'counsellor',
    currentUserId?: string | null
  ): Promise<FetchFollowUpsResult> {
    if (configStatus.isConfigured && currentUserId) {
      try {
        let query = supabase
          .from('follow_ups')
          .select(`
            *,
            lead:leads!follow_ups_lead_id_fkey(id, full_name, phone, course_interest, status),
            assignee:profiles!follow_ups_assigned_to_fkey(id, full_name)
          `)
          .order('due_at', { ascending: true })

        if (userRole === 'counsellor') {
          query = query.or(
            `assigned_to.eq.${currentUserId},created_by.eq.${currentUserId},assigned_to.is.null`
          )
        }

        const { data, error } = await query

        if (!error && data) {
          const followUps: FollowUpRecord[] = data.map((row: any) => ({
            id: row.id,
            lead_id: row.lead_id,
            assigned_to: row.assigned_to,
            due_at: row.due_at,
            note: row.note,
            status: row.status as FollowUpStatus,
            completed_at: row.completed_at,
            created_by: row.created_by,
            created_at: row.created_at,
            lead_name: row.lead?.full_name || 'Student Lead',
            lead_phone: row.lead?.phone || '',
            lead_course: row.lead?.course_interest || '',
            lead_status: (row.lead?.status as LeadStatus) || 'New',
            assignee_name: row.assignee?.full_name || 'Unassigned',
          }))

          return {
            followUps,
            isDemoFallback: false,
          }
        }
      } catch (err) {
        console.warn('[followUpsService] Supabase fetch failed, using local fallback:', err)
      }
    }

    // LocalStorage Fallback
    let list = this.getStoredMockFollowUps()

    if (userRole === 'counsellor') {
      list = list.filter(
        (f) =>
          f.assigned_to === 'demo-counsellor-001' ||
          f.assignee_name?.toLowerCase().includes('priya') ||
          (currentUserId && f.assigned_to === currentUserId)
      )
    }

    // Sort: pending items first by earliest due_at, then completed items by most recent completed_at
    list.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1
      if (a.status !== 'pending' && b.status === 'pending') return 1
      return new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
    })

    return {
      followUps: list,
      isDemoFallback: true,
    }
  },

  /**
   * Fetch follow-ups for a single lead (used in Lead Detail View)
   */
  async getFollowUpsByLead(
    leadId: string,
    currentUserId?: string | null
  ): Promise<FollowUpRecord[]> {
    const res = await this.getFollowUps('admin', currentUserId)
    return res.followUps.filter((f) => f.lead_id === leadId)
  },

  /**
   * Schedule a new follow-up and record audit activity
   */
  async createFollowUp(
    input: CreateFollowUpInput,
    currentUserId?: string | null,
    userRole: UserRole = 'counsellor',
    actorName = 'Staff Member'
  ): Promise<FollowUpRecord> {
    const trimmedNote = input.note.trim()
    if (!trimmedNote) {
      throw new Error('Please enter a follow-up note or action description.')
    }
    if (!input.lead_id) {
      throw new Error('Please select a student lead for this follow-up.')
    }
    if (!input.due_at) {
      throw new Error('Please select a valid due date and time.')
    }

    let assignedTo = input.assigned_to || null
    if (!assignedTo && userRole === 'counsellor') {
      assignedTo = currentUserId || 'demo-counsellor-001'
    }

    // 1. Live Supabase Insert when authenticated
    if (configStatus.isConfigured && currentUserId) {
      try {
        const { data, error } = await supabase
          .from('follow_ups')
          .insert({
            lead_id: input.lead_id,
            assigned_to: assignedTo,
            due_at: input.due_at,
            note: trimmedNote,
            status: 'pending',
            created_by: currentUserId,
          })
          .select(`
            *,
            lead:leads!follow_ups_lead_id_fkey(id, full_name, phone, course_interest, status),
            assignee:profiles!follow_ups_assigned_to_fkey(id, full_name)
          `)
          .single()

        if (!error && data) {
          const created: FollowUpRecord = {
            id: data.id,
            lead_id: data.lead_id,
            assigned_to: data.assigned_to,
            due_at: data.due_at,
            note: data.note,
            status: data.status as FollowUpStatus,
            completed_at: data.completed_at,
            created_by: data.created_by,
            created_at: data.created_at,
            lead_name: data.lead?.full_name || 'Student Lead',
            lead_phone: data.lead?.phone || '',
            lead_course: data.lead?.course_interest || '',
            lead_status: (data.lead?.status as LeadStatus) || 'New',
            assignee_name: data.assignee?.full_name || 'Unassigned',
          }

          await activitiesService.logActivity({
            lead_id: created.lead_id,
            actor_id: currentUserId,
            actor_name: actorName,
            activity_type: 'followup_added',
            description: `Scheduled follow-up: "${trimmedNote}"`,
            metadata: { due_at: created.due_at },
          })

          return created
        }
      } catch (err) {
        console.warn('[followUpsService] Supabase insert exception, using local store:', err)
      }
    }

    // 2. LocalStorage Persistence
    const leads = leadsService.getStoredMockLeads()
    const parentLead = leads.find((l) => l.id === input.lead_id)
    const counsellors = await leadsService.getCounsellors()
    const matchedCounsellor = counsellors.find((c) => c.id === assignedTo)
    const assigneeName =
      matchedCounsellor?.full_name.split(' (')[0] ||
      parentLead?.assignee_name ||
      (userRole === 'counsellor' ? 'Priya Sharma' : 'Aarav Patel')

    const newFollowUp: FollowUpRecord = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `fup-${Date.now()}`,
      lead_id: input.lead_id,
      assigned_to: assignedTo || 'demo-counsellor-001',
      due_at: new Date(input.due_at).toISOString(),
      note: trimmedNote,
      status: 'pending',
      completed_at: null,
      created_by: currentUserId || 'demo-counsellor-001',
      created_at: new Date().toISOString(),
      lead_name: parentLead?.full_name || 'Student Enquiry',
      lead_phone: parentLead?.phone || '',
      lead_course: parentLead?.course_interest || '',
      lead_status: parentLead?.status || 'New',
      assignee_name: assigneeName,
    }

    const currentList = this.getStoredMockFollowUps()
    const updatedList = [newFollowUp, ...currentList]
    this.saveStoredMockFollowUps(updatedList)

    await activitiesService.logActivity({
      lead_id: newFollowUp.lead_id,
      actor_id: currentUserId || 'demo-counsellor-001',
      actor_name: actorName,
      activity_type: 'followup_added',
      description: `Scheduled follow-up: "${trimmedNote}"`,
      metadata: { due_at: newFollowUp.due_at },
    })

    return newFollowUp
  },

  /**
   * 1-Click Mark Follow-Up as Completed (status = 'completed', completed_at = now())
   */
  async markFollowUpCompleted(
    followUpId: string,
    currentUserId?: string | null,
    actorName = 'Staff Member'
  ): Promise<FollowUpRecord> {
    const completedAt = new Date().toISOString()

    // 1. Live Supabase Update when authenticated
    if (configStatus.isConfigured && currentUserId) {
      try {
        const { data, error } = await supabase
          .from('follow_ups')
          .update({
            status: 'completed',
            completed_at: completedAt,
          })
          .eq('id', followUpId)
          .select(`
            *,
            lead:leads!follow_ups_lead_id_fkey(id, full_name, phone, course_interest, status),
            assignee:profiles!follow_ups_assigned_to_fkey(id, full_name)
          `)
          .single()

        if (!error && data) {
          const updated: FollowUpRecord = {
            id: data.id,
            lead_id: data.lead_id,
            assigned_to: data.assigned_to,
            due_at: data.due_at,
            note: data.note,
            status: 'completed',
            completed_at: data.completed_at || completedAt,
            created_by: data.created_by,
            created_at: data.created_at,
            lead_name: data.lead?.full_name || 'Student Lead',
            lead_phone: data.lead?.phone || '',
            lead_course: data.lead?.course_interest || '',
            lead_status: (data.lead?.status as LeadStatus) || 'New',
            assignee_name: data.assignee?.full_name || 'Unassigned',
          }

          await activitiesService.logActivity({
            lead_id: updated.lead_id,
            actor_id: currentUserId,
            actor_name: actorName,
            activity_type: 'followup_completed',
            description: `Completed follow-up: "${updated.note}"`,
            metadata: { completed_at: completedAt },
          })

          return updated
        }
      } catch (err) {
        console.warn('[followUpsService] Supabase completion fallback to local:', err)
      }
    }

    // 2. LocalStorage Update
    const currentList = this.getStoredMockFollowUps()
    const idx = currentList.findIndex((f) => f.id === followUpId)
    if (idx === -1) {
      throw new Error('Follow-up record not found')
    }

    const updatedItem: FollowUpRecord = {
      ...currentList[idx],
      status: 'completed',
      completed_at: completedAt,
    }

    currentList[idx] = updatedItem
    this.saveStoredMockFollowUps(currentList)

    await activitiesService.logActivity({
      lead_id: updatedItem.lead_id,
      actor_id: currentUserId || 'demo-counsellor-001',
      actor_name: actorName,
      activity_type: 'followup_completed',
      description: `Completed follow-up: "${updatedItem.note}"`,
      metadata: { completed_at: completedAt },
    })

    return updatedItem
  },

  /**
   * Compute reconciled urgency statistics across follow-up items
   */
  getFollowUpStats(followUps: FollowUpRecord[]): FollowUpStats {
    const stats: FollowUpStats = {
      total: followUps.length,
      overdueCount: 0,
      dueTodayCount: 0,
      upcomingCount: 0,
      completedCount: 0,
    }

    for (const item of followUps) {
      const urgency = computeFollowUpUrgency(item.due_at, item.status)
      if (urgency === 'overdue') stats.overdueCount++
      else if (urgency === 'due_today') stats.dueTodayCount++
      else if (urgency === 'upcoming') stats.upcomingCount++
      else if (urgency === 'completed') stats.completedCount++
    }

    return stats
  },
}
