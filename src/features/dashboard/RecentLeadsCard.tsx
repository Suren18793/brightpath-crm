import {
  Clock,
  CheckCircle2,
  ArrowUpRight,
  AlertTriangle,
  CalendarClock,
  Users,
} from 'lucide-react'
import type { DashboardMetrics } from '../../services/metricsService'
import type { Lead } from '../../types/leads'
import {
  computeFollowUpUrgency,
  formatFollowUpTimeLabel,
  type FollowUpRecord,
} from '../../types/followups'

export interface RecentLeadsCardProps {
  metrics: DashboardMetrics
  isLoading?: boolean
  completingFollowUpId?: string | null
  onViewAllLeads: () => void
  onSelectLead: (lead: Lead) => void
  onGoToScheduler: () => void
  onMarkFollowUpCompleted: (followUp: FollowUpRecord) => void
}

function formatShortDate(isoString: string): string {
  try {
    const d = new Date(isoString)
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return isoString
  }
}

export function RecentLeadsCard({
  metrics,
  isLoading = false,
  completingFollowUpId = null,
  onViewAllLeads,
  onSelectLead,
  onGoToScheduler,
  onMarkFollowUpCompleted,
}: RecentLeadsCardProps) {
  if (isLoading) {
    return (
      <div className="grid-2">
        <div className="card">
          <div className="card-body">
            <div className="skeleton-box" style={{ width: '100%', height: 220 }} />
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="skeleton-box" style={{ width: '100%', height: 220 }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid-2">
      {/* 1. Recent Student Enquiries Card */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={17} style={{ color: 'var(--brand-600)' }} />
            <div>
              <div className="card-title">Recent Student Enquiries</div>
              <div className="card-subtitle">
                Latest {metrics.recentLeads.length} enquiries — click any row for 360° drawer
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
            onClick={onViewAllLeads}
          >
            View All ({metrics.totalLeads})
            <ArrowUpRight size={13} />
          </button>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {metrics.recentLeads.length === 0 ? (
            <div
              style={{
                padding: '2.25rem 1.25rem',
                textAlign: 'center',
                color: 'var(--text-tertiary)',
                fontSize: '0.84rem',
              }}
            >
              No student leads found in your current scope.
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course Interest</th>
                    <th>Status</th>
                    <th>Added</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.recentLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      style={{ cursor: 'pointer' }}
                      title={`Open ${lead.full_name}'s 360° Profile`}
                    >
                      <td>
                        <div className="lead-name">{lead.full_name}</div>
                        <div className="lead-sub">{lead.source}</div>
                      </td>
                      <td style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                        {lead.course_interest}
                      </td>
                      <td>
                        <span
                          className={`badge badge-${lead.status.toLowerCase()}`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-tertiary)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatShortDate(lead.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 2. Urgent & Overdue Follow-Ups Card */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarClock
              size={17}
              style={{
                color:
                  metrics.overdueFollowUpsCount > 0 ? '#e11d48' : 'var(--brand-600)',
              }}
            />
            <div>
              <div className="card-title">Urgent Follow-Up Action Queue</div>
              <div className="card-subtitle">
                Overdue and due-today tasks requiring immediate counsellor action
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
            onClick={onGoToScheduler}
          >
            Open Scheduler
            <ArrowUpRight size={13} />
          </button>
        </div>

        <div
          className="card-body"
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          {metrics.urgentFollowUps.length === 0 ? (
            <div
              style={{
                padding: '2rem 1rem',
                textAlign: 'center',
                color: 'var(--text-tertiary)',
                fontSize: '0.84rem',
              }}
            >
              All caught up! Zero pending or overdue follow-up reminders.
            </div>
          ) : (
            metrics.urgentFollowUps.map((fup) => {
              const urgency = computeFollowUpUrgency(fup.due_at, fup.status)
              const isOverdue = urgency === 'overdue'
              const isDueToday = urgency === 'due_today'
              const isCompleting = completingFollowUpId === fup.id

              return (
                <div
                  key={fup.id}
                  className="dashboard-urgent-fup-item"
                  style={{
                    padding: '0.8rem 0.95rem',
                    borderRadius: 'var(--radius-md)',
                    background: isOverdue
                      ? '#fff1f2'
                      : isDueToday
                      ? '#fffbeb'
                      : 'var(--bg-app)',
                    border: isOverdue
                      ? '1px solid #fecdd3'
                      : isDueToday
                      ? '1px solid #fde68a'
                      : '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '0.65rem',
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '0.84rem',
                            color: isOverdue
                              ? '#881337'
                              : 'var(--text-primary)',
                          }}
                        >
                          {fup.lead_name || 'Student Lead'}{' '}
                          {fup.lead_course ? `— ${fup.lead_course}` : ''}
                        </span>
                        <span
                          className={`badge ${
                            isOverdue
                              ? 'badge-lost'
                              : isDueToday
                              ? 'badge-qualified'
                              : 'badge-contacted'
                          }`}
                          style={{ fontSize: '0.66rem' }}
                        >
                          {isOverdue ? (
                            <>
                              <AlertTriangle
                                size={10}
                                style={{ marginRight: 3 }}
                              />
                              OVERDUE
                            </>
                          ) : isDueToday ? (
                            <>
                              <Clock size={10} style={{ marginRight: 3 }} />
                              DUE TODAY
                            </>
                          ) : (
                            'UPCOMING'
                          )}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: '0.77rem',
                          color: isOverdue ? '#9f1239' : 'var(--text-secondary)',
                          marginTop: '0.28rem',
                          lineHeight: 1.4,
                        }}
                      >
                        {fup.note}
                      </div>

                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--text-tertiary)',
                          marginTop: '0.3rem',
                        }}
                      >
                        {formatFollowUpTimeLabel(fup.due_at, fup.status)} • Counsellor:{' '}
                        {fup.assignee_name || 'Unassigned'}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{
                        padding: '0.32rem 0.6rem',
                        fontSize: '0.73rem',
                        background: '#ffffff',
                        color: '#059669',
                        borderColor: '#a7f3d0',
                        flexShrink: 0,
                      }}
                      disabled={isCompleting}
                      onClick={() => onMarkFollowUpCompleted(fup)}
                      title="Mark follow-up completed directly from Dashboard"
                    >
                      <CheckCircle2 size={13} />
                      {isCompleting ? 'Saving...' : 'Mark Done'}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
