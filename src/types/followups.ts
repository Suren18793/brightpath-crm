import type { LeadStatus } from './leads'

export type FollowUpStatus = 'pending' | 'completed' | 'cancelled'

export type FollowUpUrgency =
  | 'overdue'
  | 'due_today'
  | 'upcoming'
  | 'completed'
  | 'cancelled'

export type FollowUpFilterTab =
  | 'all'
  | 'overdue'
  | 'due_today'
  | 'upcoming'
  | 'completed'

export interface FollowUpRecord {
  id: string
  lead_id: string
  assigned_to: string | null
  due_at: string
  note: string
  status: FollowUpStatus
  completed_at: string | null
  created_by: string | null
  created_at: string
  // Populated relation fields
  lead_name?: string
  lead_phone?: string
  lead_course?: string
  lead_status?: LeadStatus
  assignee_name?: string
}

export interface CreateFollowUpInput {
  lead_id: string
  assigned_to?: string | null
  due_at: string
  note: string
}

export interface FollowUpStats {
  total: number
  overdueCount: number
  dueTodayCount: number
  upcomingCount: number
  completedCount: number
}

/**
 * Evaluates follow-up urgency dynamically against current wall-clock time.
 * Overdue rule: status === 'pending' && due_at < now()
 */
export function computeFollowUpUrgency(
  dueAt: string,
  status: FollowUpStatus
): FollowUpUrgency {
  if (status === 'completed') return 'completed'
  if (status === 'cancelled') return 'cancelled'

  const dueMs = new Date(dueAt).getTime()
  const nowMs = Date.now()

  if (dueMs < nowMs) {
    return 'overdue'
  }

  const dueDate = new Date(dueAt)
  const nowDate = new Date()
  const isSameDay =
    dueDate.getFullYear() === nowDate.getFullYear() &&
    dueDate.getMonth() === nowDate.getMonth() &&
    dueDate.getDate() === nowDate.getDate()

  const hoursUntilDue = (dueMs - nowMs) / (1000 * 3600)

  if (isSameDay || hoursUntilDue <= 12) {
    return 'due_today'
  }

  return 'upcoming'
}

/**
 * Formats a human-readable relative time description for follow-up cards
 */
export function formatFollowUpTimeLabel(
  dueAt: string,
  status: FollowUpStatus,
  completedAt?: string | null
): string {
  if (status === 'completed') {
    if (completedAt) {
      const compDate = new Date(completedAt)
      return `Completed ${compDate.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })} at ${compDate.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      })}`
    }
    return 'Completed'
  }

  const dueMs = new Date(dueAt).getTime()
  const nowMs = Date.now()
  const diffMin = Math.round((dueMs - nowMs) / (1000 * 60))
  const absMin = Math.abs(diffMin)

  if (diffMin < 0) {
    if (absMin < 60) {
      return `Overdue by ${absMin}m`
    }
    const hrs = Math.round(absMin / 60)
    if (hrs < 24) {
      return `Overdue by ${hrs}h`
    }
    const days = Math.round(hrs / 24)
    return `Overdue by ${days}d`
  }

  if (diffMin < 60) {
    return `Due in ${diffMin}m`
  }
  const hrs = Math.round(diffMin / 60)
  if (hrs <= 18) {
    return `Due in ${hrs}h`
  }
  const days = Math.round(hrs / 24)
  return `Due in ${days}d`
}

