import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Plus, ShieldCheck } from 'lucide-react'
import {
  metricsService,
  type DashboardMetrics,
} from '../../services/metricsService'
import { followUpsService } from '../../services/followUpsService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { KpiGrid } from './KpiGrid'
import { PipelineChart } from './PipelineChart'
import { RecentLeadsCard } from './RecentLeadsCard'
import type { Lead } from '../../types/leads'
import type { FollowUpRecord } from '../../types/followups'

export interface DashboardViewProps {
  onNavigateToLeads: () => void
  onNavigateToFollowUps: () => void
  onQuickNewLead: () => void
  onSelectLead: (lead: Lead) => void
  onUrgentCountChange?: (overdueCount: number) => void
}

const EMPTY_METRICS: DashboardMetrics = {
  totalLeads: 0,
  newLeadsCount: 0,
  contactedLeadsCount: 0,
  qualifiedLeadsCount: 0,
  convertedLeadsCount: 0,
  lostLeadsCount: 0,
  overdueFollowUpsCount: 0,
  dueTodayFollowUpsCount: 0,
  conversionRate: 0,
  statusDistribution: [],
  sourceDistribution: [],
  recentLeads: [],
  urgentFollowUps: [],
  isDemoFallback: false,
}

export function DashboardView({
  onNavigateToLeads,
  onNavigateToFollowUps,
  onQuickNewLead,
  onSelectLead,
  onUrgentCountChange,
}: DashboardViewProps) {
  const { role, user, profile } = useAuth()
  const { showToast } = useToast()

  const [metrics, setMetrics] = useState<DashboardMetrics>(EMPTY_METRICS)
  const [isLoading, setIsLoading] = useState(true)
  const [completingFollowUpId, setCompletingFollowUpId] = useState<
    string | null
  >(null)

  const loadMetrics = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await metricsService.getDashboardMetrics(role, user?.id)
      setMetrics(data)
      onUrgentCountChange?.(data.overdueFollowUpsCount)
    } finally {
      setIsLoading(false)
    }
  }, [role, user?.id, onUrgentCountChange])

  useEffect(() => {
    loadMetrics()
  }, [loadMetrics])

  const handleMarkFollowUpCompleted = async (fup: FollowUpRecord) => {
    setCompletingFollowUpId(fup.id)
    try {
      const actorName = profile?.full_name || user?.email || 'Counsellor'
      await followUpsService.markFollowUpCompleted(
        fup.id,
        user?.id,
        actorName
      )

      showToast(
        `Marked follow-up for "${fup.lead_name || 'Student Lead'}" as completed.`,
        'success'
      )

      await loadMetrics()
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to complete follow-up',
        'error'
      )
    } finally {
      setCompletingFollowUpId(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
      {/* Page Title & Action Header */}
      <div className="page-title-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <h1 className="page-title">Admissions Command Center</h1>
            <span
              className="badge badge-contacted"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <ShieldCheck size={12} />
              {role === 'counsellor'
                ? 'Personal Counsellor Scope'
                : `Full Team Aggregate (${role.toUpperCase()})`}
            </span>
          </div>
          <p className="page-subtitle">
            100% reconciled real-time student enquiry metrics, stage distributions, and urgent follow-up actions
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadMetrics}
            disabled={isLoading}
            title="Refresh real-time analytics"
          >
            <RefreshCw
              size={15}
              className={isLoading ? 'spin-icon' : undefined}
            />
            Refresh
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onQuickNewLead}
          >
            <Plus size={16} />
            New Lead
          </button>
        </div>
      </div>

      {/* 5 Reconciled KPI Summary Cards */}
      <KpiGrid
        metrics={metrics}
        isLoading={isLoading}
        onNavigateToLeads={onNavigateToLeads}
        onNavigateToFollowUps={onNavigateToFollowUps}
      />

      {/* Pipeline Stage & Source Distributions */}
      <PipelineChart
        metrics={metrics}
        isLoading={isLoading}
        onSelectStatus={() => onNavigateToLeads()}
      />

      {/* Recent Enquiries & Urgent Follow-Up Queue */}
      <RecentLeadsCard
        metrics={metrics}
        isLoading={isLoading}
        completingFollowUpId={completingFollowUpId}
        onViewAllLeads={onNavigateToLeads}
        onSelectLead={onSelectLead}
        onGoToScheduler={onNavigateToFollowUps}
        onMarkFollowUpCompleted={handleMarkFollowUpCompleted}
      />
    </div>
  )
}
