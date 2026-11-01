import { BarChart3, PieChart } from 'lucide-react'
import type { DashboardMetrics } from '../../services/metricsService'
import type { LeadStatus, LeadSource } from '../../types/leads'

export interface PipelineChartProps {
  metrics: DashboardMetrics
  isLoading?: boolean
  onSelectStatus?: (status: LeadStatus) => void
}

const STATUS_STYLE_MAP: Record<
  LeadStatus,
  {
    color: string
    badgeClass: string
    description: string
  }
> = {
  New: {
    color: '#3b82f6',
    badgeClass: 'badge-new',
    description: 'Initial student enquiries awaiting first contact',
  },
  Contacted: {
    color: '#6366f1',
    badgeClass: 'badge-contacted',
    description: 'Active phone/WhatsApp counselling in progress',
  },
  Qualified: {
    color: '#f59e0b',
    badgeClass: 'badge-qualified',
    description: 'Course fit & fee eligibility verified',
  },
  Converted: {
    color: '#10b981',
    badgeClass: 'badge-converted',
    description: 'Confirmed student admissions & enrollments',
  },
  Lost: {
    color: '#f43f5e',
    badgeClass: 'badge-lost',
    description: 'Closed enquiries with documented lost reason',
  },
}

const SOURCE_COLOR_MAP: Record<LeadSource, string> = {
  Website: '#2563eb',
  'Walk-in': '#059669',
  'Phone Call': '#7c3aed',
  WhatsApp: '#10b981',
  Referral: '#d97706',
  Other: '#64748b',
}

export function PipelineChart({
  metrics,
  isLoading = false,
  onSelectStatus,
}: PipelineChartProps) {
  if (isLoading) {
    return (
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="skeleton-box skeleton-text-primary" style={{ width: 200 }} />
          </div>
          <div className="card-body">
            <div className="skeleton-box" style={{ width: '100%', height: 180 }} />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="skeleton-box skeleton-text-primary" style={{ width: 200 }} />
          </div>
          <div className="card-body">
            <div className="skeleton-box" style={{ width: '100%', height: 180 }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid-2">
      {/* 1. Leads by Status Distribution */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={17} style={{ color: 'var(--brand-600)' }} />
            <div>
              <div className="card-title">Pipeline Stage Distribution</div>
              <div className="card-subtitle">
                Reconciled breakdown across all {metrics.totalLeads} accessible leads
              </div>
            </div>
          </div>
          <span className="badge badge-qualified">5 Lifecycle Stages</span>
        </div>

        <div className="card-body">
          {/* Stacked Multi-Segment Progress Bar */}
          <div className="pipeline-stacked-bar" aria-label="Pipeline distribution bar">
            {metrics.totalLeads === 0 ? (
              <div
                style={{
                  width: '100%',
                  background: '#e2e8f0',
                  height: '100%',
                }}
              />
            ) : (
              metrics.statusDistribution.map((item) => {
                if (item.count === 0) return null
                const cfg = STATUS_STYLE_MAP[item.status]
                return (
                  <div
                    key={item.status}
                    className="pipeline-stacked-segment"
                    style={{
                      width: `${Math.max(item.percentage, 3)}%`,
                      background: cfg.color,
                    }}
                    title={`${item.status}: ${item.count} (${item.percentage}%)`}
                  />
                )
              })
            )}
          </div>

          {/* Individual Stage Breakdown Rows */}
          <div className="pipeline-stage-list">
            {metrics.statusDistribution.map((item) => {
              const cfg = STATUS_STYLE_MAP[item.status]
              return (
                <div
                  key={item.status}
                  className={`pipeline-stage-row ${
                    onSelectStatus ? 'pipeline-stage-clickable' : ''
                  }`}
                  onClick={() => onSelectStatus?.(item.status)}
                >
                  <div className="pipeline-stage-info">
                    <span
                      className="pipeline-stage-dot"
                      style={{ background: cfg.color }}
                    />
                    <span className={`badge ${cfg.badgeClass}`}>{item.status}</span>
                    <span className="pipeline-stage-desc">{cfg.description}</span>
                  </div>

                  <div className="pipeline-stage-metrics">
                    <span className="pipeline-stage-count">{item.count}</span>
                    <span className="pipeline-stage-pct">
                      ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 2. Leads by Acquisition Source Breakdown */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChart size={17} style={{ color: 'var(--brand-600)' }} />
            <div>
              <div className="card-title">Leads by Acquisition Source</div>
              <div className="card-subtitle">
                Channel volume and admission conversion efficiency
              </div>
            </div>
          </div>
          <span className="badge badge-new">Channel ROI</span>
        </div>

        <div className="card-body">
          <div className="source-breakdown-list">
            {metrics.sourceDistribution.map((item) => {
              const barColor = SOURCE_COLOR_MAP[item.source] || '#3b82f6'
              return (
                <div key={item.source} className="source-bar-row">
                  <div className="source-bar-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span
                        className="pipeline-stage-dot"
                        style={{ background: barColor }}
                      />
                      <span className="source-bar-name">{item.source}</span>
                    </div>
                    <div className="source-bar-stats">
                      <strong>{item.count}</strong> leads ({item.percentage.toFixed(1)}%)
                      {item.count > 0 && (
                        <span className="source-conv-pill">
                          {item.convertedCount} converted ({item.conversionRate.toFixed(0)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="source-progress-track">
                    <div
                      className="source-progress-fill"
                      style={{
                        width: `${item.percentage}%`,
                        background: barColor,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
