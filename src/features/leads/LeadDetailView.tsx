import { useState, useEffect, useCallback } from 'react'
import {
  X,
  Phone,
  MessageCircle,
  Mail,
  GraduationCap,
  Radio,
  UserCheck,
  Calendar,
  Edit3,
  FileText,
  Send,
  CalendarPlus,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import type { Lead, LeadStatus } from '../../types/leads'
import type { UserRole } from '../../types/auth'
import {
  computeFollowUpUrgency,
  formatFollowUpTimeLabel,
  type FollowUpRecord,
} from '../../types/followups'
import { leadsService } from '../../services/leadsService'
import { followUpsService } from '../../services/followUpsService'
import {
  activitiesService,
  type ActivityRecord,
} from '../../services/activitiesService'
import { useToast } from '../../context/ToastContext'
import { LeadStatusSelect } from './LeadStatusSelect'
import { FollowUpModal } from '../followups/FollowUpModal'
import { ActivityTimeline } from '../activity/ActivityTimeline'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'

export interface LeadDetailViewProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
  onEditLead: (lead: Lead) => void
  onStatusChange: (lead: Lead, nextStatus: LeadStatus) => Promise<void> | void
  onLeadUpdated: () => void
  counsellors: { id: string; full_name: string }[]
  userRole: UserRole
  currentUserId?: string | null
  actorName?: string
  isUpdatingStatus?: boolean
}

export function LeadDetailView({
  lead,
  isOpen,
  onClose,
  onEditLead,
  onStatusChange,
  onLeadUpdated,
  counsellors,
  userRole,
  currentUserId,
  actorName = 'Staff Member',
  isUpdatingStatus = false,
}: LeadDetailViewProps) {
  const { showToast } = useToast()

  const [followUps, setFollowUps] = useState<FollowUpRecord[]>([])
  const [activities, setActivities] = useState<ActivityRecord[]>([])
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false)

  const [quickNote, setQuickNote] = useState<string>('')
  const [isSavingNote, setIsSavingNote] = useState<boolean>(false)
  const [completingFollowUpId, setCompletingFollowUpId] = useState<string | null>(null)
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState<boolean>(false)

  const loadLeadTimelineAndFollowUps = useCallback(async () => {
    if (!lead) return
    setIsLoadingDetails(true)
    try {
      const [fups, acts] = await Promise.all([
        followUpsService.getFollowUpsByLead(lead.id, currentUserId),
        activitiesService.getActivitiesByLead(lead.id, currentUserId),
      ])
      setFollowUps(fups)
      setActivities(acts)
    } catch (err) {
      console.error('[LeadDetailView] Failed to load lead details:', err)
    } finally {
      setIsLoadingDetails(false)
    }
  }, [lead, currentUserId])

  useEffect(() => {
    if (isOpen && lead) {
      loadLeadTimelineAndFollowUps()
      setQuickNote('')
    }
  }, [isOpen, lead, loadLeadTimelineAndFollowUps])

  // Close drawer on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isFollowUpModalOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isFollowUpModalOpen, onClose])

  if (!isOpen || !lead) return null

  const cleanPhoneForWhatsApp = (phone: string) => phone.replace(/[^0-9]/g, '')

  const handleAddQuickNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickNote.trim()) return

    setIsSavingNote(true)
    try {
      await leadsService.addLeadNote(
        lead.id,
        quickNote.trim(),
        lead.notes,
        currentUserId,
        actorName
      )
      setQuickNote('')
      showToast('Counselling note saved & logged to timeline', 'success')
      onLeadUpdated()
      await loadLeadTimelineAndFollowUps()
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to save note',
        'error'
      )
    } finally {
      setIsSavingNote(false)
    }
  }

  const handleCompleteFollowUp = async (fup: FollowUpRecord) => {
    setCompletingFollowUpId(fup.id)
    try {
      await followUpsService.markFollowUpCompleted(
        fup.id,
        currentUserId,
        actorName
      )
      showToast('Follow-up marked as completed', 'success')
      onLeadUpdated()
      await loadLeadTimelineAndFollowUps()
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to complete follow-up',
        'error'
      )
    } finally {
      setCompletingFollowUpId(null)
    }
  }

  const getFollowUpBadgeVariant = (fup: FollowUpRecord): BadgeVariant => {
    const urgency = computeFollowUpUrgency(fup.due_at, fup.status)
    switch (urgency) {
      case 'overdue':
        return 'overdue'
      case 'due_today':
        return 'qualified'
      case 'upcoming':
        return 'new'
      case 'completed':
        return 'converted'
      default:
        return 'neutral'
    }
  }

  return (
    <div
      className="lead-drawer-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-detail-drawer-title"
      onClick={onClose}
    >
      <aside
        className="lead-detail-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Drawer Header */}
        <div className="lead-drawer-header">
          <div className="lead-drawer-title-group">
            <div className="lead-drawer-avatar">
              {lead.full_name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <h2 id="lead-detail-drawer-title" className="lead-drawer-name">
                {lead.full_name}
              </h2>
              <div className="lead-drawer-course">
                <GraduationCap size={13} />
                <span>{lead.course_interest}</span>
              </div>
            </div>
          </div>

          <div className="lead-drawer-header-actions">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onEditLead(lead)}
            >
              <Edit3 size={13} />
              <span>Edit</span>
            </Button>
            <button
              type="button"
              className="crm-modal-close-btn"
              onClick={onClose}
              aria-label="Close lead detail drawer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="lead-drawer-body">
          {/* 1. Status Progression & Quick Outreach Bar */}
          <div className="lead-drawer-top-bar">
            <div className="drawer-status-box">
              <span className="drawer-meta-label">Pipeline Stage</span>
              <LeadStatusSelect
                lead={lead}
                isUpdating={isUpdatingStatus}
                onStatusChange={async (l, nextStatus) => {
                  await onStatusChange(l, nextStatus)
                  await loadLeadTimelineAndFollowUps()
                }}
              />
            </div>

            <div className="drawer-outreach-actions">
              <a
                href={`tel:${lead.phone}`}
                className="drawer-outreach-btn call"
                title={`Call ${lead.phone}`}
              >
                <Phone size={14} />
                <span>Call</span>
              </a>
              <a
                href={`https://wa.me/${cleanPhoneForWhatsApp(lead.phone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="drawer-outreach-btn whatsapp"
                title="Open WhatsApp chat"
              >
                <MessageCircle size={14} />
                <span>WhatsApp</span>
              </a>
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="drawer-outreach-btn email"
                  title={`Email ${lead.email}`}
                >
                  <Mail size={14} />
                  <span>Email</span>
                </a>
              )}
            </div>
          </div>

          {/* Lost Reason Banner (When status is Lost) */}
          {lead.status === 'Lost' && lead.lost_reason && (
            <div className="drawer-lost-banner">
              <AlertTriangle size={15} />
              <div>
                <strong>Lost Reason:</strong> {lead.lost_reason}
              </div>
            </div>
          )}

          {/* 2. Contact & Acquisition Metadata Grid */}
          <div className="drawer-info-grid">
            <div className="drawer-info-cell">
              <span className="drawer-info-label">
                <Phone size={12} /> Phone Number
              </span>
              <span className="drawer-info-value">{lead.phone}</span>
            </div>

            <div className="drawer-info-cell">
              <span className="drawer-info-label">
                <Mail size={12} /> Email Address
              </span>
              <span className="drawer-info-value">
                {lead.email || 'Not provided'}
              </span>
            </div>

            <div className="drawer-info-cell">
              <span className="drawer-info-label">
                <Radio size={12} /> Acquisition Source
              </span>
              <span className="drawer-info-value">{lead.source}</span>
            </div>

            <div className="drawer-info-cell">
              <span className="drawer-info-label">
                <UserCheck size={12} /> Assigned Counsellor
              </span>
              <span className="drawer-info-value">
                {lead.assignee_name || 'Unassigned'}
              </span>
            </div>

            <div className="drawer-info-cell">
              <span className="drawer-info-label">
                <Calendar size={12} /> Enquiry Created
              </span>
              <span className="drawer-info-value">
                {new Date(lead.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="drawer-info-cell">
              <span className="drawer-info-label">
                <Clock size={12} /> Last Updated
              </span>
              <span className="drawer-info-value">
                {new Date(lead.updated_at).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* 3. Counselling Notes & Quick Add Note Form */}
          <div className="drawer-section-card">
            <div className="drawer-section-header">
              <div className="drawer-section-title">
                <FileText size={15} />
                <span>Counselling Notes & Academic Background</span>
              </div>
            </div>

            {lead.notes ? (
              <div className="drawer-notes-display">{lead.notes}</div>
            ) : (
              <p className="drawer-empty-hint">
                No counselling notes recorded yet. Add a note below.
              </p>
            )}

            <form onSubmit={handleAddQuickNote} className="drawer-quick-note-form">
              <textarea
                className="crm-input drawer-note-input"
                rows={2}
                placeholder="Log a new call summary, scholarship score, or parent preference..."
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                disabled={isSavingNote}
              />
              <div className="drawer-note-submit-row">
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  isLoading={isSavingNote}
                  disabled={!quickNote.trim()}
                >
                  <Send size={12} />
                  <span>Add Note</span>
                </Button>
              </div>
            </form>
          </div>

          {/* 4. Scheduled Follow-Ups for This Lead */}
          <div className="drawer-section-card">
            <div className="drawer-section-header">
              <div className="drawer-section-title">
                <Clock size={15} />
                <span>Scheduled Follow-Ups ({followUps.length})</span>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsFollowUpModalOpen(true)}
              >
                <CalendarPlus size={13} />
                <span>+ Schedule</span>
              </Button>
            </div>

            {followUps.length === 0 ? (
              <p className="drawer-empty-hint">
                No follow-ups scheduled for {lead.full_name}. Click &ldquo;+ Schedule&rdquo; to set a callback reminder.
              </p>
            ) : (
              <div className="drawer-followups-list">
                {followUps.map((fup) => {
                  const urgency = computeFollowUpUrgency(fup.due_at, fup.status)
                  const timeLabel = formatFollowUpTimeLabel(
                    fup.due_at,
                    fup.status,
                    fup.completed_at
                  )
                  return (
                    <div
                      key={fup.id}
                      className={`drawer-followup-item urgency-${urgency}`}
                    >
                      <div className="drawer-fup-top">
                        <Badge variant={getFollowUpBadgeVariant(fup)}>
                          {urgency.replace('_', ' ').toUpperCase()} • {timeLabel}
                        </Badge>
                        {fup.status === 'pending' ? (
                          <Button
                            size="sm"
                            variant={urgency === 'overdue' ? 'danger' : 'secondary'}
                            isLoading={completingFollowUpId === fup.id}
                            onClick={() => handleCompleteFollowUp(fup)}
                          >
                            <CheckCircle2 size={12} />
                            <span>Mark Done</span>
                          </Button>
                        ) : (
                          <span className="drawer-fup-done-tag">
                            <CheckCircle2 size={12} /> Done
                          </span>
                        )}
                      </div>
                      <p className="drawer-fup-note">{fup.note}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 5. Chronological Audit Activity Timeline */}
          <ActivityTimeline
            activities={activities}
            isLoading={isLoadingDetails}
          />
        </div>

        {/* Preselected Lead Follow-Up Modal */}
        <FollowUpModal
          isOpen={isFollowUpModalOpen}
          onClose={() => setIsFollowUpModalOpen(false)}
          onSuccess={async () => {
            onLeadUpdated()
            await loadLeadTimelineAndFollowUps()
          }}
          leads={[lead]}
          counsellors={counsellors}
          userRole={userRole}
          currentUserId={currentUserId}
          actorName={actorName}
          preselectedLeadId={lead.id}
        />
      </aside>
    </div>
  )
}
