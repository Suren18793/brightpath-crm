import { Loader2, AlertCircle } from 'lucide-react'
import type { Lead, LeadStatus } from '../../types/leads'

export interface LeadStatusSelectProps {
  lead: Lead
  isUpdating?: boolean
  onStatusChange: (lead: Lead, nextStatus: LeadStatus) => void
}

const PIPELINE_STATUSES: LeadStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Converted',
  'Lost',
]

export function LeadStatusSelect({
  lead,
  isUpdating = false,
  onStatusChange,
}: LeadStatusSelectProps) {
  const statusClass = `lead-status-select status-pill-${lead.status.toLowerCase()}`

  return (
    <div
      className="lead-status-select-wrapper"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="lead-status-select-box">
        <select
          aria-label={`Change status for ${lead.full_name}`}
          className={statusClass}
          value={lead.status}
          disabled={isUpdating}
          onChange={(e) => {
            const nextStatus = e.target.value as LeadStatus
            if (nextStatus !== lead.status) {
              onStatusChange(lead, nextStatus)
            }
          }}
        >
          {PIPELINE_STATUSES.map((st) => (
            <option key={st} value={st}>
              {st.toUpperCase()}
            </option>
          ))}
        </select>

        {isUpdating && (
          <Loader2 size={12} className="status-select-spinner spinning" />
        )}
      </div>

      {lead.status === 'Lost' && lead.lost_reason && (
        <div className="lost-reason-caption" title={lead.lost_reason}>
          <AlertCircle size={10} />
          <span>{lead.lost_reason}</span>
        </div>
      )}
    </div>
  )
}
