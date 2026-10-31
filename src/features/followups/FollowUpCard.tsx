import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Phone,
  MessageCircle,
  GraduationCap,
  UserCheck,
  ExternalLink,
} from 'lucide-react'
import {
  computeFollowUpUrgency,
  formatFollowUpTimeLabel,
  type FollowUpRecord,
} from '../../types/followups'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'

export interface FollowUpCardProps {
  followUp: FollowUpRecord
  isCompleting?: boolean
  onMarkCompleted: (followUp: FollowUpRecord) => void
  onJumpToLead?: (leadId: string, leadName?: string) => void
}

export function FollowUpCard({
  followUp,
  isCompleting = false,
  onMarkCompleted,
  onJumpToLead,
}: FollowUpCardProps) {
  const urgency = computeFollowUpUrgency(followUp.due_at, followUp.status)
  const timeLabel = formatFollowUpTimeLabel(
    followUp.due_at,
    followUp.status,
    followUp.completed_at
  )

  const getUrgencyBadgeProps = (): {
    variant: BadgeVariant
    label: string
  } => {
    switch (urgency) {
      case 'overdue':
        return { variant: 'overdue', label: `OVERDUE • ${timeLabel}` }
      case 'due_today':
        return { variant: 'qualified', label: `DUE TODAY • ${timeLabel}` }
      case 'upcoming':
        return { variant: 'new', label: `UPCOMING • ${timeLabel}` }
      case 'completed':
        return { variant: 'converted', label: `COMPLETED` }
      default:
        return { variant: 'neutral', label: followUp.status.toUpperCase() }
    }
  }

  const badgeInfo = getUrgencyBadgeProps()

  const formatExactDateTime = (iso: string) => {
    try {
      const d = new Date(iso)
      return d.toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return iso
    }
  }

  const cleanPhoneForWhatsApp = (phone?: string) => {
    if (!phone) return ''
    return phone.replace(/[^0-9]/g, '')
  }

  return (
    <div className={`followup-card followup-card-${urgency}`}>
      {/* Top Row: Urgency Badge + Due Timestamp */}
      <div className="followup-card-top">
        <Badge variant={badgeInfo.variant}>
          {urgency === 'overdue' && <AlertTriangle size={11} />}
          {urgency === 'due_today' && <Clock size={11} />}
          {urgency === 'upcoming' && <Calendar size={11} />}
          {urgency === 'completed' && <CheckCircle2 size={11} />}
          <span>{badgeInfo.label}</span>
        </Badge>

        <span className="followup-exact-time">
          Due: {formatExactDateTime(followUp.due_at)}
        </span>
      </div>

      {/* Student Lead Info & Jump Link */}
      <div className="followup-lead-header">
        <div>
          <h4 className="followup-student-name">
            {followUp.lead_name || 'Student Lead'}
          </h4>
          {followUp.lead_course && (
            <div className="followup-course-row">
              <GraduationCap size={13} />
              <span>{followUp.lead_course}</span>
            </div>
          )}
        </div>

        {onJumpToLead && (
          <button
            type="button"
            className="followup-jump-lead-btn"
            onClick={() => onJumpToLead(followUp.lead_id, followUp.lead_name)}
            title="View related student enquiry in Leads table"
          >
            <span>View Lead</span>
            <ExternalLink size={11} />
          </button>
        )}
      </div>

      {/* Follow-Up Note Box */}
      <p className="followup-note-body">{followUp.note}</p>

      {/* Meta Footer: Assignee + Completed Timestamp if done */}
      <div className="followup-meta-row">
        <div className="followup-assignee-tag">
          <UserCheck size={12} />
          <span>{followUp.assignee_name || 'Priya Sharma'}</span>
        </div>

        {followUp.status === 'completed' && followUp.completed_at && (
          <span className="followup-completed-stamp">
            <CheckCircle2 size={11} /> {timeLabel}
          </span>
        )}
      </div>

      {/* Actions Toolbar */}
      <div className="followup-actions-bar">
        <div className="followup-outreach-links">
          {followUp.lead_phone && (
            <>
              <a
                href={`tel:${followUp.lead_phone}`}
                className="followup-outreach-pill call"
                title={`Call ${followUp.lead_phone}`}
              >
                <Phone size={12} />
                <span>Call</span>
              </a>
              <a
                href={`https://wa.me/${cleanPhoneForWhatsApp(followUp.lead_phone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="followup-outreach-pill whatsapp"
                title="Open WhatsApp chat"
              >
                <MessageCircle size={12} />
                <span>WhatsApp</span>
              </a>
            </>
          )}
        </div>

        {followUp.status === 'pending' ? (
          <Button
            size="sm"
            variant={urgency === 'overdue' ? 'danger' : 'primary'}
            isLoading={isCompleting}
            onClick={() => onMarkCompleted(followUp)}
          >
            <CheckCircle2 size={14} />
            <span>Mark Completed</span>
          </Button>
        ) : (
          <span className="followup-done-indicator">
            <CheckCircle2 size={14} />
            <span>Action Completed</span>
          </span>
        )}
      </div>
    </div>
  )
}
