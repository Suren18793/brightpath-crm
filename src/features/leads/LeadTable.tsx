import {
  Phone,
  Mail,
  GraduationCap,
  Clock,
  ArrowUpDown,
  SearchX,
  Edit3,
} from 'lucide-react'
import type { Lead, LeadStatus, LeadFilterState } from '../../types/leads'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'

export interface LeadTableProps {
  leads: Lead[]
  isLoading: boolean
  filters: LeadFilterState
  onFilterChange: (filters: LeadFilterState) => void
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

export function LeadTable({
  leads,
  isLoading,
  filters,
  onFilterChange,
  onResetFilters,
  onSelectLead,
  onEditLead,
}: LeadTableProps) {
  const handleSortToggle = (column: 'full_name' | 'status' | 'created_at') => {
    if (filters.sortBy === column) {
      onFilterChange({
        ...filters,
        sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
      })
    } else {
      onFilterChange({
        ...filters,
        sortBy: column,
        sortOrder: column === 'created_at' ? 'desc' : 'asc',
      })
    }
  }

  const formatLeadDate = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return isoString
    }
  }

  const formatFollowUpDue = (isoString?: string | null) => {
    if (!isoString) return null
    try {
      const due = new Date(isoString).getTime()
      const now = Date.now()
      const diffHrs = Math.round((due - now) / (1000 * 3600))

      if (diffHrs < 0) {
        return {
          text: `Overdue (${Math.abs(diffHrs)}h ago)`,
          variant: 'overdue' as const,
        }
      }
      if (diffHrs <= 12) {
        return {
          text: `Due in ${diffHrs}h`,
          variant: 'qualified' as const,
        }
      }
      return {
        text: `Due in ${Math.round(diffHrs / 24)}d`,
        variant: 'new' as const,
      }
    } catch {
      return null
    }
  }

  return (
    <div className="lead-table-container">
      <div className="lead-table-scroll-wrapper">
        <table className="crm-lead-table">
          <thead>
            <tr>
              <th
                onClick={() => handleSortToggle('full_name')}
                className="sortable-th"
                style={{ width: '22%' }}
              >
                <div className="th-content">
                  <span>Student Name</span>
                  <ArrowUpDown size={12} className="sort-icon" />
                </div>
              </th>
              <th style={{ width: '15%' }}>Contact</th>
              <th style={{ width: '18%' }}>Course Interest</th>
              <th style={{ width: '11%' }}>Source</th>
              <th
                onClick={() => handleSortToggle('status')}
                className="sortable-th"
                style={{ width: '12%' }}
              >
                <div className="th-content">
                  <span>Status</span>
                  <ArrowUpDown size={12} className="sort-icon" />
                </div>
              </th>
              <th style={{ width: '14%' }}>Assignee</th>
              <th
                onClick={() => handleSortToggle('created_at')}
                className="sortable-th"
                style={{ width: '8%', textAlign: 'right' }}
              >
                <div className="th-content" style={{ justifyContent: 'flex-end' }}>
                  <span>Created</span>
                  <ArrowUpDown size={12} className="sort-icon" />
                </div>
              </th>
              <th style={{ width: '8%', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Skeleton Loading Rows
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="lead-table-skeleton-row">
                  <td>
                    <div className="skeleton-box skeleton-text-primary" />
                    <div className="skeleton-box skeleton-text-sub" />
                  </td>
                  <td>
                    <div className="skeleton-box skeleton-text-phone" />
                  </td>
                  <td>
                    <div className="skeleton-box skeleton-text-course" />
                  </td>
                  <td>
                    <div className="skeleton-box skeleton-pill" />
                  </td>
                  <td>
                    <div className="skeleton-box skeleton-badge" />
                  </td>
                  <td>
                    <div className="skeleton-box skeleton-text-assignee" />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="skeleton-box skeleton-date" />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="skeleton-box" style={{ width: 45, height: 24, margin: '0 auto' }} />
                  </td>
                </tr>
              ))
            ) : leads.length === 0 ? (
              // Empty Search Results
              <tr>
                <td colSpan={8} className="lead-table-empty-td">
                  <div className="table-empty-box">
                    <SearchX size={36} className="table-empty-icon" />
                    <h4 className="table-empty-title">No matching student leads found</h4>
                    <p className="table-empty-desc">
                      Try adjusting your search terms or clearing status and source filters to see more leads.
                    </p>
                    <Button variant="secondary" size="sm" onClick={onResetFilters}>
                      Reset All Filters
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              // Leads Data Rows
              leads.map((lead) => {
                const followup = formatFollowUpDue(lead.next_followup_due)
                return (
                  <tr
                    key={lead.id}
                    className="lead-table-row"
                    onClick={() => onSelectLead?.(lead)}
                  >
                    {/* Student Name & Email */}
                    <td>
                      <div className="student-name-box">
                        <span className="student-name">{lead.full_name}</span>
                        {lead.email ? (
                          <span className="student-email">
                            <Mail size={11} /> {lead.email}
                          </span>
                        ) : (
                          <span className="student-email-empty">No email provided</span>
                        )}
                      </div>
                    </td>

                    {/* Phone */}
                    <td>
                      <a
                        href={`tel:${lead.phone}`}
                        className="lead-phone-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone size={12} />
                        <span>{lead.phone}</span>
                      </a>
                    </td>

                    {/* Course */}
                    <td>
                      <div className="lead-course-box">
                        <GraduationCap size={13} className="course-icon" />
                        <span className="course-name">{lead.course_interest}</span>
                      </div>
                    </td>

                    {/* Source */}
                    <td>
                      <span className="source-tag">{lead.source}</span>
                    </td>

                    {/* Status Badge + Next Followup Pill */}
                    <td>
                      <div className="lead-status-column">
                        <Badge variant={getBadgeVariant(lead.status)}>
                          {lead.status.toUpperCase()}
                        </Badge>
                        {followup && (
                          <Badge variant={followup.variant} className="followup-mini-pill">
                            <Clock size={9} />
                            <span>{followup.text}</span>
                          </Badge>
                        )}
                      </div>
                    </td>

                    {/* Assignee */}
                    <td>
                      <div className="assignee-cell">
                        <div className="assignee-avatar-sm">
                          {(lead.assignee_name || 'U')
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <span className="assignee-name">
                          {lead.assignee_name || 'Unassigned'}
                        </span>
                      </div>
                    </td>

                    {/* Created Date */}
                    <td style={{ textAlign: 'right' }}>
                      <span className="lead-date-cell">
                        {formatLeadDate(lead.created_at)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="row-action-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditLead?.(lead)
                        }}
                        title="Edit lead details"
                      >
                        <Edit3 size={11} />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
