import { useState, useEffect, useCallback } from 'react'
import {
  CalendarPlus,
  RefreshCw,
  Search,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { followUpsService } from '../../services/followUpsService'
import { leadsService } from '../../services/leadsService'
import {
  computeFollowUpUrgency,
  type FollowUpRecord,
  type FollowUpFilterTab,
  type FollowUpStats,
} from '../../types/followups'
import type { Lead } from '../../types/leads'
import { INITIAL_LEAD_FILTERS } from '../../types/leads'
import { FollowUpCard } from './FollowUpCard'
import { FollowUpModal } from './FollowUpModal'
import { Button } from '../../components/ui/Button'

export interface FollowUpListViewProps {
  onJumpToLead?: (leadId: string, leadName?: string) => void
  onUrgentCountChange?: (urgentCount: number) => void
}

export function FollowUpListView({
  onJumpToLead,
  onUrgentCountChange,
}: FollowUpListViewProps) {
  const { role, user, profile } = useAuth()
  const { showToast } = useToast()

  const [followUps, setFollowUps] = useState<FollowUpRecord[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [counsellors, setCounsellors] = useState<{ id: string; full_name: string }[]>([])
  const [activeFilter, setActiveFilter] = useState<FollowUpFilterTab>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isDemoFallback, setIsDemoFallback] = useState<boolean>(false)
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const [stats, setStats] = useState<FollowUpStats>({
    total: 0,
    overdueCount: 0,
    dueTodayCount: 0,
    upcomingCount: 0,
    completedCount: 0,
  })

  const actorName =
    profile?.full_name ||
    (user?.email
      ? user.email.split('@')[0]
      : role === 'counsellor'
      ? 'Priya Sharma'
      : 'Aarav Patel')

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [fupRes, leadsRes, counsellorList] = await Promise.all([
        followUpsService.getFollowUps(role, user?.id),
        leadsService.getLeads(INITIAL_LEAD_FILTERS, role, user?.id),
        leadsService.getCounsellors(),
      ])

      setFollowUps(fupRes.followUps)
      setIsDemoFallback(fupRes.isDemoFallback)
      setLeads(leadsRes.leads)
      setCounsellors(counsellorList)

      const computedStats = followUpsService.getFollowUpStats(fupRes.followUps)
      setStats(computedStats)
      onUrgentCountChange?.(computedStats.overdueCount)
    } catch (err) {
      console.error('[FollowUpListView] Error loading follow-ups:', err)
    } finally {
      setIsLoading(false)
    }
  }, [role, user?.id, onUrgentCountChange])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleMarkCompleted = async (item: FollowUpRecord) => {
    setCompletingId(item.id)
    try {
      await followUpsService.markFollowUpCompleted(
        item.id,
        user?.id,
        actorName
      )
      showToast(
        `Follow-up for ${item.lead_name || 'student'} marked completed!`,
        'success'
      )
      await loadData()
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to complete follow-up',
        'error'
      )
    } finally {
      setCompletingId(null)
    }
  }

  // Filter items by selected urgency tab & search query
  const filteredFollowUps = followUps.filter((item) => {
    const urgency = computeFollowUpUrgency(item.due_at, item.status)

    if (activeFilter !== 'all' && urgency !== activeFilter) {
      return false
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const matchesLead = item.lead_name?.toLowerCase().includes(q)
      const matchesCourse = item.lead_course?.toLowerCase().includes(q)
      const matchesNote = item.note.toLowerCase().includes(q)
      const matchesAssignee = item.assignee_name?.toLowerCase().includes(q)
      return Boolean(matchesLead || matchesCourse || matchesNote || matchesAssignee)
    }

    return true
  })

  return (
    <div className="lead-list-view-container">
      {/* Overdue Alert Banner when overdueCount > 0 */}
      {stats.overdueCount > 0 && (
        <div className="overdue-alert-ribbon">
          <div className="overdue-ribbon-left">
            <AlertTriangle size={16} />
            <span>
              <strong>
                {stats.overdueCount} Overdue Follow-Up{stats.overdueCount > 1 ? 's' : ''}
              </strong>{' '}
              require immediate outreach (`status = 'pending' AND due_at &lt; now()`).
            </span>
          </div>
          {activeFilter !== 'overdue' && (
            <button
              type="button"
              className="overdue-filter-shortcut"
              onClick={() => setActiveFilter('overdue')}
            >
              Show Overdue Only
            </button>
          )}
        </div>
      )}

      {/* Main View Header */}
      <div className="lead-view-header">
        <div className="lead-view-title-box">
          <div className="title-row">
            <h2 className="lead-view-title">Follow-Up Scheduler & Overdue Engine</h2>
            {isDemoFallback && (
              <span className="demo-data-pill">
                <Sparkles size={11} /> Demo Data Active
              </span>
            )}
          </div>
          <p className="lead-view-subtitle">
            {role === 'counsellor'
              ? 'Manage your scheduled student callbacks, counselling reminders, and overdue actions.'
              : 'Monitor institute-wide follow-up SLA compliance and overdue counsellor callbacks.'}
          </p>
        </div>

        <div className="lead-view-actions">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="refresh-btn"
          >
            <RefreshCw size={14} className={isLoading ? 'spinning' : ''} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="new-lead-main-btn"
          >
            <CalendarPlus size={15} />
            <span>+ Schedule Follow-up</span>
          </Button>
        </div>
      </div>

      {/* Urgency Metric Filter Chips */}
      <div className="status-metric-chips-bar">
        <button
          type="button"
          className={`status-metric-chip ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          <span className="chip-label">All Follow-ups</span>
          <span className="chip-count">{stats.total}</span>
        </button>

        <button
          type="button"
          className={`status-metric-chip chip-overdue ${
            activeFilter === 'overdue' ? 'active' : ''
          }`}
          onClick={() => setActiveFilter('overdue')}
        >
          <span className="chip-label">Overdue</span>
          <span className="chip-count">{stats.overdueCount}</span>
        </button>

        <button
          type="button"
          className={`status-metric-chip chip-qualified ${
            activeFilter === 'due_today' ? 'active' : ''
          }`}
          onClick={() => setActiveFilter('due_today')}
        >
          <span className="chip-label">Due Today</span>
          <span className="chip-count">{stats.dueTodayCount}</span>
        </button>

        <button
          type="button"
          className={`status-metric-chip chip-new ${
            activeFilter === 'upcoming' ? 'active' : ''
          }`}
          onClick={() => setActiveFilter('upcoming')}
        >
          <span className="chip-label">Upcoming</span>
          <span className="chip-count">{stats.upcomingCount}</span>
        </button>

        <button
          type="button"
          className={`status-metric-chip chip-converted ${
            activeFilter === 'completed' ? 'active' : ''
          }`}
          onClick={() => setActiveFilter('completed')}
        >
          <span className="chip-label">Completed</span>
          <span className="chip-count">{stats.completedCount}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="lead-filter-bar" style={{ padding: '0.75rem 1rem' }}>
        <div className="filter-bar-top-row" style={{ marginBottom: 0 }}>
          <div className="filter-search-wrapper">
            <Search size={16} className="filter-search-icon" />
            <input
              type="text"
              className="filter-search-input"
              placeholder="Search follow-ups by student name, course, counsellor, or note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="filter-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {(activeFilter !== 'all' || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActiveFilter('all')
                setSearchQuery('')
              }}
            >
              Reset View
            </Button>
          )}
        </div>
      </div>

      {/* Follow-Up Cards Grid */}
      {isLoading ? (
        <div className="followups-cards-grid">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="followup-card skeleton-card" style={{ minHeight: 165 }}>
              <div className="skeleton-box skeleton-badge" style={{ width: '40%' }} />
              <div className="skeleton-box skeleton-text-primary" style={{ width: '65%' }} />
              <div className="skeleton-box skeleton-text-sub" style={{ width: '90%' }} />
            </div>
          ))}
        </div>
      ) : filteredFollowUps.length === 0 ? (
        <div className="table-empty-box mobile-empty-box">
          <CheckCircle2 size={36} className="table-empty-icon" />
          <h4 className="table-empty-title">No follow-ups in this view</h4>
          <p className="table-empty-desc">
            {activeFilter === 'overdue'
              ? 'Great job! There are zero overdue follow-ups right now.'
              : 'Schedule a new student follow-up or clear your active filter.'}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            {activeFilter !== 'all' && (
              <Button variant="secondary" size="sm" onClick={() => setActiveFilter('all')}>
                Show All Follow-ups
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
              + Schedule Follow-up
            </Button>
          </div>
        </div>
      ) : (
        <div className="followups-cards-grid">
          {filteredFollowUps.map((fup) => (
            <FollowUpCard
              key={fup.id}
              followUp={fup}
              isCompleting={completingId === fup.id}
              onMarkCompleted={handleMarkCompleted}
              onJumpToLead={onJumpToLead}
            />
          ))}
        </div>
      )}

      {/* Schedule Follow-Up Modal */}
      <FollowUpModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          loadData()
        }}
        leads={leads}
        counsellors={counsellors}
        userRole={role}
        currentUserId={user?.id}
        actorName={actorName}
      />
    </div>
  )
}

