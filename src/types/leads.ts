export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost'

export type LeadSource =
  | 'Website'
  | 'Phone Call'
  | 'WhatsApp'
  | 'Referral'
  | 'Walk-in'
  | 'Other'

export interface Lead {
  id: string
  full_name: string
  email: string | null
  phone: string
  course_interest: string
  source: LeadSource
  status: LeadStatus
  lost_reason: string | null
  assigned_to: string | null
  created_by: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Populated fields from joins/seed
  assignee_name?: string | null
  next_followup_due?: string | null
  next_followup_status?: 'pending' | 'completed' | 'cancelled' | null
}

export interface LeadFilterState {
  searchQuery: string
  status: LeadStatus | 'all'
  source: LeadSource | 'all'
  assignedTo: string | 'all'
  sortBy: 'created_at' | 'full_name' | 'status'
  sortOrder: 'asc' | 'desc'
}

export interface LeadStats {
  total: number
  newCount: number
  contactedCount: number
  qualifiedCount: number
  convertedCount: number
  lostCount: number
}

export const INITIAL_LEAD_FILTERS: LeadFilterState = {
  searchQuery: '',
  status: 'all',
  source: 'all',
  assignedTo: 'all',
  sortBy: 'created_at',
  sortOrder: 'desc',
}
