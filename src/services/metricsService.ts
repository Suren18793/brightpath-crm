import { leadsService } from './leadsService'
import { followUpsService } from './followUpsService'
import {
  INITIAL_LEAD_FILTERS,
  type Lead,
  type LeadStatus,
  type LeadSource,
} from '../types/leads'
import {
  computeFollowUpUrgency,
  type FollowUpRecord,
} from '../types/followups'
import type { UserRole } from '../types/auth'

export interface StatusDistributionItem {
  status: LeadStatus
  count: number
  percentage: number
}

export interface SourceDistributionItem {
  source: LeadSource
  count: number
  convertedCount: number
  percentage: number
  conversionRate: number
}

export interface DashboardMetrics {
  totalLeads: number
  newLeadsCount: number
  contactedLeadsCount: number
  qualifiedLeadsCount: number
  convertedLeadsCount: number
  lostLeadsCount: number
  overdueFollowUpsCount: number
  dueTodayFollowUpsCount: number
  conversionRate: number
  statusDistribution: StatusDistributionItem[]
  sourceDistribution: SourceDistributionItem[]
  recentLeads: Lead[]
  urgentFollowUps: FollowUpRecord[]
  isDemoFallback: boolean
}

const ALL_STATUSES: LeadStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Converted',
  'Lost',
]

const ALL_SOURCES: LeadSource[] = [
  'Website',
  'Walk-in',
  'Phone Call',
  'WhatsApp',
  'Referral',
  'Other',
]

export const metricsService = {
  /**
   * Computes 100% reconciled, role-scoped dashboard KPIs and distributions.
   * Division-by-zero protected for 0 leads.
   */
  async getDashboardMetrics(
    userRole: UserRole = 'counsellor',
    currentUserId?: string | null
  ): Promise<DashboardMetrics> {
    const [leadsRes, followUpsRes] = await Promise.all([
      leadsService.getLeads(INITIAL_LEAD_FILTERS, userRole, currentUserId),
      followUpsService.getFollowUps(userRole, currentUserId),
    ])

    const leads = leadsRes.leads
    const followUps = followUpsRes.followUps
    const leadStats = leadsService.getLeadStats(leads)
    const fupStats = followUpsService.getFollowUpStats(followUps)

    const totalLeads = leadStats.total
    const convertedLeadsCount = leadStats.convertedCount

    // Division-by-zero protected conversion rate percentage
    const conversionRate =
      totalLeads > 0
        ? Number(((convertedLeadsCount / totalLeads) * 100).toFixed(1))
        : 0

    // 1. Leads by Status Distribution
    const statusDistribution: StatusDistributionItem[] = ALL_STATUSES.map(
      (status) => {
        const count = leads.filter((l) => l.status === status).length
        const percentage =
          totalLeads > 0 ? Number(((count / totalLeads) * 100).toFixed(1)) : 0
        return {
          status,
          count,
          percentage,
        }
      }
    )

    // 2. Leads by Acquisition Source Breakdown
    const sourceDistribution: SourceDistributionItem[] = ALL_SOURCES.map(
      (source) => {
        const sourceLeads = leads.filter((l) => l.source === source)
        const count = sourceLeads.length
        const convertedCount = sourceLeads.filter(
          (l) => l.status === 'Converted'
        ).length
        const percentage =
          totalLeads > 0 ? Number(((count / totalLeads) * 100).toFixed(1)) : 0
        const srcConvRate =
          count > 0 ? Number(((convertedCount / count) * 100).toFixed(1)) : 0

        return {
          source,
          count,
          convertedCount,
          percentage,
          conversionRate: srcConvRate,
        }
      }
    ).sort((a, b) => b.count - a.count)

    // 3. Top 5 Recent Leads (sorted by created_at DESC)
    const recentLeads = [...leads]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 5)

    // 4. Urgent Action Follow-Ups (pending overdue + due today + earliest upcoming)
    const pendingFollowUps = followUps
      .filter((f) => f.status === 'pending')
      .sort((a, b) => {
        const urgA = computeFollowUpUrgency(a.due_at, a.status)
        const urgB = computeFollowUpUrgency(b.due_at, b.status)
        const priority = {
          overdue: 0,
          due_today: 1,
          upcoming: 2,
          completed: 3,
          cancelled: 4,
        }
        if (priority[urgA] !== priority[urgB]) {
          return priority[urgA] - priority[urgB]
        }
        return new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
      })
      .slice(0, 5)

    return {
      totalLeads,
      newLeadsCount: leadStats.newCount,
      contactedLeadsCount: leadStats.contactedCount,
      qualifiedLeadsCount: leadStats.qualifiedCount,
      convertedLeadsCount,
      lostLeadsCount: leadStats.lostCount,
      overdueFollowUpsCount: fupStats.overdueCount,
      dueTodayFollowUpsCount: fupStats.dueTodayCount,
      conversionRate,
      statusDistribution,
      sourceDistribution,
      recentLeads,
      urgentFollowUps: pendingFollowUps,
      isDemoFallback: leadsRes.isDemoFallback,
    }
  },
}
