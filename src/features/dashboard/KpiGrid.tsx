import {
  Users,
  UserPlus,
  GraduationCap,
  AlertCircle,
  TrendingUp,
} from 'lucide-react'
import type { DashboardMetrics } from '../../services/metricsService'

export interface KpiGridProps {
  metrics: DashboardMetrics
  isLoading?: boolean
  onNavigateToLeads?: () => void
  onNavigateToFollowUps?: () => void
}

export function KpiGrid({
  metrics,
  isLoading = false,
  onNavigateToLeads,
  onNavigateToFollowUps,
}: KpiGridProps) {
  if (isLoading) {
    return (
      <div className="dashboard-kpi-grid-5">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="kpi-card-v2 skeleton-card">
            <div className="skeleton-box skeleton-text-sub" style={{ width: '55%' }} />
            <div className="skeleton-box skeleton-text-primary" style={{ width: '40%', height: 28 }} />
            <div className="skeleton-box skeleton-text-sub" style={{ width: '75%' }} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="dashboard-kpi-grid-5">
      {/* 1. Total Accessible Leads */}
      <div
        className="kpi-card-v2 kpi-theme-blue"
        onClick={onNavigateToLeads}
        role={onNavigateToLeads ? 'button' : undefined}
        tabIndex={onNavigateToLeads ? 0 : undefined}
      >
        <div className="kpi-v2-top">
          <span className="kpi-v2-label">Total Accessible Leads</span>
          <div className="kpi-v2-icon icon-blue">
            <Users size={17} />
          </div>
        </div>
        <div className="kpi-v2-value">{metrics.totalLeads}</div>
        <div className="kpi-v2-sub">
          {metrics.contactedLeadsCount + metrics.qualifiedLeadsCount} active in counselling
        </div>
      </div>

      {/* 2. New Leads (status = 'New') */}
      <div
        className="kpi-card-v2 kpi-theme-indigo"
        onClick={onNavigateToLeads}
        role={onNavigateToLeads ? 'button' : undefined}
        tabIndex={onNavigateToLeads ? 0 : undefined}
      >
        <div className="kpi-v2-top">
          <span className="kpi-v2-label">New Enquiries</span>
          <div className="kpi-v2-icon icon-indigo">
            <UserPlus size={17} />
          </div>
        </div>
        <div className="kpi-v2-value">{metrics.newLeadsCount}</div>
        <div className="kpi-v2-sub">Awaiting initial outreach (`status = New`)</div>
      </div>

      {/* 3. Converted Leads (status = 'Converted') */}
      <div
        className="kpi-card-v2 kpi-theme-emerald"
        onClick={onNavigateToLeads}
        role={onNavigateToLeads ? 'button' : undefined}
        tabIndex={onNavigateToLeads ? 0 : undefined}
      >
        <div className="kpi-v2-top">
          <span className="kpi-v2-label">Converted Admissions</span>
          <div className="kpi-v2-icon icon-emerald">
            <GraduationCap size={17} />
          </div>
        </div>
        <div className="kpi-v2-value">{metrics.convertedLeadsCount}</div>
        <div className="kpi-v2-sub">Enrolled students (`status = Converted`)</div>
      </div>

      {/* 4. Overdue Follow-ups (status = 'pending' AND due_at < now()) */}
      <div
        className={`kpi-card-v2 ${
          metrics.overdueFollowUpsCount > 0 ? 'kpi-theme-rose-alert' : 'kpi-theme-slate'
        }`}
        onClick={onNavigateToFollowUps}
        role={onNavigateToFollowUps ? 'button' : undefined}
        tabIndex={onNavigateToFollowUps ? 0 : undefined}
      >
        <div className="kpi-v2-top">
          <span className="kpi-v2-label">Overdue Follow-Ups</span>
          <div className="kpi-v2-icon icon-rose">
            <AlertCircle size={17} />
          </div>
        </div>
        <div className="kpi-v2-value">{metrics.overdueFollowUpsCount}</div>
        <div className="kpi-v2-sub">
          {metrics.dueTodayFollowUpsCount > 0
            ? `+${metrics.dueTodayFollowUpsCount} due later today`
            : 'Pending & past due_at'}
        </div>
      </div>

      {/* 5. Conversion Rate % (Converted / Total * 100, division-by-zero protected) */}
      <div className="kpi-card-v2 kpi-theme-amber">
        <div className="kpi-v2-top">
          <span className="kpi-v2-label">Conversion Rate</span>
          <div className="kpi-v2-icon icon-amber">
            <TrendingUp size={17} />
          </div>
        </div>
        <div className="kpi-v2-value">{metrics.conversionRate.toFixed(1)}%</div>
        <div className="kpi-v2-sub">
          {metrics.convertedLeadsCount} of {metrics.totalLeads} enquiries admitted
        </div>
      </div>
    </div>
  )
}
