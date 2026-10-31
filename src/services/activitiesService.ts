import { supabase, configStatus } from '../lib/supabaseClient'
import type { LeadStatus } from '../types/leads'

export type ActivityType =
  | 'created'
  | 'status_changed'
  | 'followup_added'
  | 'followup_completed'
  | 'note_added'
  | 'lead_reassigned'

export interface ActivityMetadata {
  from_status?: LeadStatus
  to_status?: LeadStatus
  lost_reason?: string | null
  source?: string
  due_at?: string
  [key: string]: unknown
}

export interface ActivityRecord {
  id: string
  lead_id: string
  actor_id: string | null
  actor_name?: string
  activity_type: ActivityType
  description: string
  metadata: ActivityMetadata
  created_at: string
}

export interface LogActivityInput {
  lead_id: string
  actor_id?: string | null
  actor_name?: string
  activity_type: ActivityType
  description: string
  metadata?: ActivityMetadata
}

const ACTIVITIES_STORAGE_KEY = 'brightpath_crm_mock_activities'

export const SEED_ACTIVITIES: ActivityRecord[] = [
  {
    id: 'act-1111-01',
    lead_id: '11111111-1111-4111-8111-111111111111',
    actor_id: 'demo-counsellor-001',
    actor_name: 'Priya Sharma',
    activity_type: 'created',
    description: 'Lead captured via Website enquiry for JEE Advanced Masterclass',
    metadata: { source: 'Website', to_status: 'New' },
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    id: 'act-2222-01',
    lead_id: '22222222-2222-4222-8222-222222222222',
    actor_id: 'demo-counsellor-001',
    actor_name: 'Priya Sharma',
    activity_type: 'created',
    description: 'Lead captured via inbound Phone Call',
    metadata: { source: 'Phone Call', to_status: 'New' },
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'act-2222-02',
    lead_id: '22222222-2222-4222-8222-222222222222',
    actor_id: 'demo-counsellor-001',
    actor_name: 'Priya Sharma',
    activity_type: 'status_changed',
    description: 'Status changed from New to Contacted',
    metadata: { from_status: 'New', to_status: 'Contacted', lost_reason: null },
    created_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
  },
  {
    id: 'act-4444-01',
    lead_id: '44444444-4444-4444-8444-444444444444',
    actor_id: 'demo-counsellor-001',
    actor_name: 'Priya Sharma',
    activity_type: 'status_changed',
    description: 'Status changed from Contacted to Qualified',
    metadata: { from_status: 'Contacted', to_status: 'Qualified', lost_reason: null },
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'act-5555-01',
    lead_id: '55555555-5555-4555-8555-555555555555',
    actor_id: 'demo-manager-002',
    actor_name: 'Aarav Patel',
    activity_type: 'status_changed',
    description: 'Status changed from Qualified to Converted',
    metadata: { from_status: 'Qualified', to_status: 'Converted', lost_reason: null },
    created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'act-6666-01',
    lead_id: '66666666-6666-4666-8666-666666666666',
    actor_id: 'demo-counsellor-001',
    actor_name: 'Priya Sharma',
    activity_type: 'status_changed',
    description:
      'Marked as Lost — Reason: Enrolled in a competitor program offering 100% remote job guarantee.',
    metadata: {
      from_status: 'Contacted',
      to_status: 'Lost',
      lost_reason: 'Enrolled in a competitor program offering 100% remote job guarantee.',
    },
    created_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
  },
]

export const activitiesService = {
  /**
   * Load local fallback activities from LocalStorage
   */
  getStoredMockActivities(): ActivityRecord[] {
    try {
      const raw = localStorage.getItem(ACTIVITIES_STORAGE_KEY)
      if (raw) {
        return JSON.parse(raw) as ActivityRecord[]
      }
    } catch (err) {
      console.warn('[activitiesService] Failed to parse local activities:', err)
    }
    localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(SEED_ACTIVITIES))
    return SEED_ACTIVITIES
  },

  /**
   * Persist local fallback activities to LocalStorage
   */
  saveStoredMockActivities(activities: ActivityRecord[]): void {
    try {
      localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities))
    } catch (err) {
      console.warn('[activitiesService] Failed to save local activities:', err)
    }
  },

  /**
   * Record a new audit trail event in public.activities (with LocalStorage fallback)
   */
  async logActivity(input: LogActivityInput): Promise<ActivityRecord> {
    const metadataPayload: ActivityMetadata = input.metadata || {}

    // 1. Live Supabase Insert when authenticated
    if (configStatus.isConfigured && input.actor_id && !input.actor_id.startsWith('demo-')) {
      try {
        const { data, error } = await supabase
          .from('activities')
          .insert({
            lead_id: input.lead_id,
            actor_id: input.actor_id,
            activity_type: input.activity_type,
            description: input.description,
            metadata: metadataPayload,
          })
          .select(`
            *,
            actor:profiles!activities_actor_id_fkey(id, full_name)
          `)
          .single()

        if (!error && data) {
          return {
            id: data.id,
            lead_id: data.lead_id,
            actor_id: data.actor_id,
            actor_name: data.actor?.full_name || input.actor_name || 'Staff Member',
            activity_type: data.activity_type as ActivityType,
            description: data.description,
            metadata: (data.metadata as ActivityMetadata) || metadataPayload,
            created_at: data.created_at,
          }
        }
        console.warn('[activitiesService] Supabase insert fell back to local store:', error?.message)
      } catch (err) {
        console.warn('[activitiesService] Supabase insert exception, using local store:', err)
      }
    }

    // 2. LocalStorage Persistence
    const newRecord: ActivityRecord = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      lead_id: input.lead_id,
      actor_id: input.actor_id || 'demo-counsellor-001',
      actor_name: input.actor_name || 'Priya Sharma',
      activity_type: input.activity_type,
      description: input.description,
      metadata: metadataPayload,
      created_at: new Date().toISOString(),
    }

    const existing = this.getStoredMockActivities()
    const updated = [newRecord, ...existing]
    this.saveStoredMockActivities(updated)

    return newRecord
  },

  /**
   * Retrieve chronological activity log for a specific lead
   */
  async getActivitiesByLead(
    leadId: string,
    currentUserId?: string | null
  ): Promise<ActivityRecord[]> {
    if (configStatus.isConfigured && currentUserId) {
      try {
        const { data, error } = await supabase
          .from('activities')
          .select(`
            *,
            actor:profiles!activities_actor_id_fkey(id, full_name)
          `)
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false })

        if (!error && data && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id,
            lead_id: row.lead_id,
            actor_id: row.actor_id,
            actor_name: row.actor?.full_name || 'Staff Member',
            activity_type: row.activity_type as ActivityType,
            description: row.description,
            metadata: (row.metadata as ActivityMetadata) || {},
            created_at: row.created_at,
          }))
        }
      } catch (err) {
        console.warn('[activitiesService] Error fetching activities from Supabase:', err)
      }
    }

    const allLocal = this.getStoredMockActivities()
    return allLocal
      .filter((a) => a.lead_id === leadId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },
}
