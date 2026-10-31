import {
  Phone,
  MessageCircle,
  GraduationCap,
  Clock,
  UserCheck,
  SearchX,
  Edit3,
} from 'lucide-react'
import type { Lead, LeadStatus } from '../../types/leads'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'

export interface LeadCardMobileProps {
  leads: Lead[]
  isLoading: boolean
  onResetFilters: () => void
  onSelectLead?: (lead: Lead) => void
  onEditLead?: (lead: Lead) => void
}

function getBadgeVariant(status: LeadStatus): BadgeVariant {
  switch (status) {
    case 'New':
      return 'new'
    case 'Contacted':
      return 'contacted'
    case 'Qualified':
      return 'qualified'
    case 'Converted':
      return 'converted'
    case 'Lost':
      return 'lost'
    default:
      return 'neutral'
  }
}

export function LeadCardMobile({
  leads,
  isLoading,
  onResetFilters,
  onSelectLead,
  onEditLead,
}: LeadCardMobileProps) {
  if (isLoading) {
    return (
      <div className="mobile-leads-list">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="mobile-lead-card skeleton-card">
            <div className="skeleton-box skeleton-text-primary" style={{ width: '60%' }} />
            <div className="skeleton-box skeleton-text-sub" style={{ width: '40%' }} />
            <div className="skeleton-box skeleton-pill" style={{ width: '80%' }} />
          </div>
        ))}
      </div>
    )
  }

  if (leads.length === 0) {
    return (
      <div className="table-empty-box mobile-empty-box">
        <SearchX size={32} className="table-empty-icon" />
        <h4 className="table-empty-title">No matching student leads found</h4>
        <p className="table-empty-desc">Try clearing filters to see leads.</p>
        <Button variant="secondary" size="sm" onClick={onResetFilters}>
          Reset All Filters
        </Button>
      </div>
    )
  }

  const cleanPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/[^0-9]/g, '')
  }

  return (
    <div className="mobile-leads-list">
      {leads.map((lead) => (
        <div
          key={lead.id}
          className="mobile-lead-card"
          onClick={() => onSelectLead?.(lead)}
        >
          {/* Card Header: Student Name + Status Badge */}
          <div className="mobile-card-header">
            <div>
              <h3 className="mobile-student-name">{lead.full_name}</h3>
              <div className="mobile-course-tag">
                <GraduationCap size={12} />
                <span>{lead.course_interest}</span>
              </div>
            </div>
            <Badge variant={getBadgeVariant(lead.status)}>
              {lead.status.toUpperCase()}
            </Badge>
          </div>

          {/* Meta Details */}
          <div className="mobile-card-meta">
            <span className="source-tag">{lead.source}</span>
            <div className="mobile-assignee-row">
              <UserCheck size={11} />
              <span>{lead.assignee_name || 'Unassigned'}</span>
            </div>
            {lead.next_followup_due && (
              <div className="mobile-followup-alert">
                <Clock size={11} />
                <span>Next follow-up scheduled</span>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="mobile-card-actions" onClick={(e) => e.stopPropagation()}>
            <a href={`tel:${lead.phone}`} className="mobile-action-pill call">
              <Phone size={13} />
              <span>Call ({lead.phone})</span>
            </a>
            <a
              href={`https://wa.me/${cleanPhoneForWhatsApp(lead.phone)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-action-pill whatsapp"
            >
              <MessageCircle size={13} />
              <span>WhatsApp</span>
            </a>
            {onEditLead && (
              <button
                type="button"
                className="mobile-action-pill"
                onClick={() => onEditLead(lead)}
              >
                <Edit3 size={13} />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
