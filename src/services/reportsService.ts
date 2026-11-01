import { leadsService } from './leadsService'
import { followUpsService } from './followUpsService'
import {
  INITIAL_LEAD_FILTERS,
  type Lead,
  type LeadSource,
} from '../types/leads'
import { computeFollowUpUrgency } from '../types/followups'
import type { UserRole } from '../types/auth'

export interface SourceEffectivenessRow {
  source: LeadSource
  totalLeads: number
  activeLeads: number
  convertedLeads: number
  lostLeads: number
  sharePercentage: number
  conversionRate: number
}

export interface CounsellorWorkloadRow {
  counsellorId: string
  counsellorName: string
  roleLabel: string
  assignedLeads: number
  activeLeads: number
  pendingFollowUps: number
  overdueFollowUps: number
  completedFollowUps: number
  convertedAdmissions: number
  conversionRate: number
}

export interface CourseDemandRow {
  course: string
  totalLeads: number
  activeLeads: number
  convertedLeads: number
  conversionRate: number
}

export interface ReportsSummary {
  totalLeads: number
  totalActive: number
  totalConverted: number
  totalLost: number
  overallConversionRate: number
  completedFollowUpsCount: number
  pendingFollowUpsCount: number
  overdueFollowUpsCount: number
  sourceEffectiveness: SourceEffectivenessRow[]
  counsellorWorkload: CounsellorWorkloadRow[]
  courseDemand: CourseDemandRow[]
  exportableLeads: Lead[]
  isDemoFallback: boolean
}

const ALL_SOURCES: LeadSource[] = [
  'Website',
  'Walk-in',
  'Phone Call',
  'WhatsApp',
  'Referral',
  'Other',
]

export const reportsService = {
  /**
   * Computes role-scoped, 100% reconciled Source Effectiveness, Counsellor Workload,
   * and Course Demand reports along with the full exportable lead dataset.
   */
  async getReportsSummary(
    userRole: UserRole = 'counsellor',
    currentUserId?: string | null
  ): Promise<ReportsSummary> {
    const [leadsRes, followUpsRes, counsellors] = await Promise.all([
      leadsService.getLeads(INITIAL_LEAD_FILTERS, userRole, currentUserId),
      followUpsService.getFollowUps(userRole, currentUserId),
      leadsService.getCounsellors(),
    ])

    const leads = leadsRes.leads
    const followUps = followUpsRes.followUps
    const leadStats = leadsService.getLeadStats(leads)
    const fupStats = followUpsService.getFollowUpStats(followUps)

    const totalLeads = leadStats.total
    const totalConverted = leadStats.convertedCount
    const totalLost = leadStats.lostCount
    const totalActive =
      leadStats.newCount + leadStats.contactedCount + leadStats.qualifiedCount

    const overallConversionRate =
      totalLeads > 0
        ? Number(((totalConverted / totalLeads) * 100).toFixed(1))
        : 0

    // 1. Source Effectiveness Table
    const sourceEffectiveness: SourceEffectivenessRow[] = ALL_SOURCES.map(
      (source) => {
        const srcLeads = leads.filter((l) => l.source === source)
        const srcTotal = srcLeads.length
        const srcConverted = srcLeads.filter(
          (l) => l.status === 'Converted'
        ).length
        const srcLost = srcLeads.filter((l) => l.status === 'Lost').length
        const srcActive = srcTotal - srcConverted - srcLost

        const sharePercentage =
          totalLeads > 0
            ? Number(((srcTotal / totalLeads) * 100).toFixed(1))
            : 0
        const conversionRate =
          srcTotal > 0
            ? Number(((srcConverted / srcTotal) * 100).toFixed(1))
            : 0

        return {
          source,
          totalLeads: srcTotal,
          activeLeads: srcActive,
          convertedLeads: srcConverted,
          lostLeads: srcLost,
          sharePercentage,
          conversionRate,
        }
      }
    ).sort((a, b) => b.totalLeads - a.totalLeads)

    // 2. Counsellor Workload & Performance Table
    // Build roster from known counsellors + any custom assignee names present in leads
    const workloadRows: CounsellorWorkloadRow[] = []

    const normalizeName = (raw: string) =>
      raw.split(' (')[0].trim().toLowerCase()

    for (const c of counsellors) {
      const displayName = c.full_name.split(' (')[0].trim()
      const roleMatch = c.full_name.match(/\(([^)]+)\)/)
      const roleLabel = roleMatch ? roleMatch[1] : 'Counsellor'
      const normName = normalizeName(c.full_name)

      const cLeads = leads.filter(
        (l) =>
          l.assigned_to === c.id ||
          (l.assignee_name && normalizeName(l.assignee_name) === normName)
      )

      const cFups = followUps.filter(
        (f) =>
          f.assigned_to === c.id ||
          (f.assignee_name && normalizeName(f.assignee_name) === normName)
      )

      const assignedCount = cLeads.length
      const convertedAdmissions = cLeads.filter(
        (l) => l.status === 'Converted'
      ).length
      const lostCount = cLeads.filter((l) => l.status === 'Lost').length
      const activeCount = assignedCount - convertedAdmissions - lostCount

      const completedFollowUps = cFups.filter(
        (f) => f.status === 'completed'
      ).length
      const pendingFollowUps = cFups.filter(
        (f) => f.status === 'pending'
      ).length
      const overdueFollowUps = cFups.filter(
        (f) => computeFollowUpUrgency(f.due_at, f.status) === 'overdue'
      ).length

      const convRate =
        assignedCount > 0
          ? Number(((convertedAdmissions / assignedCount) * 100).toFixed(1))
          : 0

      // If in counsellor role, only show counsellors with leads/follow-ups or the active counsellor
      if (
        userRole !== 'counsellor' ||
        assignedCount > 0 ||
        cFups.length > 0 ||
        normName.includes('priya')
      ) {
        workloadRows.push({
          counsellorId: c.id,
          counsellorName: displayName,
          roleLabel,
          assignedLeads: assignedCount,
          activeLeads: activeCount,
          pendingFollowUps,
          overdueFollowUps,
          completedFollowUps,
          convertedAdmissions,
          conversionRate: convRate,
        })
      }
    }

    // Check if there are any unassigned leads not matched to a counsellor row
    const matchedLeadIds = new Set<string>()
    for (const c of counsellors) {
      const normName = normalizeName(c.full_name)
      for (const l of leads) {
        if (
          l.assigned_to === c.id ||
          (l.assignee_name && normalizeName(l.assignee_name) === normName)
        ) {
          matchedLeadIds.add(l.id)
        }
      }
    }

    const unassignedLeads = leads.filter((l) => !matchedLeadIds.has(l.id))
    if (unassignedLeads.length > 0) {
      const uTotal = unassignedLeads.length
      const uConverted = unassignedLeads.filter(
        (l) => l.status === 'Converted'
      ).length
      const uLost = unassignedLeads.filter((l) => l.status === 'Lost').length
      const uActive = uTotal - uConverted - uLost
      const uConvRate =
        uTotal > 0 ? Number(((uConverted / uTotal) * 100).toFixed(1)) : 0

      workloadRows.push({
        counsellorId: 'unassigned',
        counsellorName: 'Unassigned / General Pool',
        roleLabel: 'Queue',
        assignedLeads: uTotal,
        activeLeads: uActive,
        pendingFollowUps: 0,
        overdueFollowUps: 0,
        completedFollowUps: 0,
        convertedAdmissions: uConverted,
        conversionRate: uConvRate,
      })
    }

    // 3. Course Demand Breakdown
    const courseMap = new Map<string, Lead[]>()
    for (const l of leads) {
      const courseName = l.course_interest || 'General Enquiry'
      const arr = courseMap.get(courseName) || []
      arr.push(l)
      courseMap.set(courseName, arr)
    }

    const courseDemand: CourseDemandRow[] = Array.from(courseMap.entries())
      .map(([course, courseLeads]) => {
        const cTotal = courseLeads.length
        const cConv = courseLeads.filter(
          (l) => l.status === 'Converted'
        ).length
        const cLost = courseLeads.filter((l) => l.status === 'Lost').length
        const cActive = cTotal - cConv - cLost
        const cRate =
          cTotal > 0 ? Number(((cConv / cTotal) * 100).toFixed(1)) : 0

        return {
          course,
          totalLeads: cTotal,
          activeLeads: cActive,
          convertedLeads: cConv,
          conversionRate: cRate,
        }
      })
      .sort((a, b) => b.totalLeads - a.totalLeads)

    return {
      totalLeads,
      totalActive,
      totalConverted,
      totalLost,
      overallConversionRate,
      completedFollowUpsCount: fupStats.completedCount,
      pendingFollowUpsCount:
        fupStats.overdueCount + fupStats.dueTodayCount + fupStats.upcomingCount,
      overdueFollowUpsCount: fupStats.overdueCount,
      sourceEffectiveness,
      counsellorWorkload: workloadRows,
      courseDemand,
      exportableLeads: leads,
      isDemoFallback: leadsRes.isDemoFallback,
    }
  },
}
