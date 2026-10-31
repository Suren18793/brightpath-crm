import { useState, useEffect } from 'react'
import {
  X,
  CalendarClock,
  User,
  Clock,
  UserCheck,
  FileText,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import type { Lead } from '../../types/leads'
import type { FollowUpRecord } from '../../types/followups'
import type { UserRole } from '../../types/auth'
import { followUpsService } from '../../services/followUpsService'
import { useToast } from '../../context/ToastContext'
import { Button } from '../../components/ui/Button'

export interface FollowUpModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (created: FollowUpRecord) => void
  leads: Lead[]
  counsellors: { id: string; full_name: string }[]
  userRole: UserRole
  currentUserId?: string | null
  actorName?: string
  preselectedLeadId?: string | null
}

/**
 * Formats a Date object into 'YYYY-MM-DDTHH:mm' for <input type="datetime-local" />
 */
function toLocalDateTimeInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const yr = date.getFullYear()
  const mo = pad(date.getMonth() + 1)
  const da = pad(date.getDate())
  const hr = pad(date.getHours())
  const mi = pad(date.getMinutes())
  return `${yr}-${mo}-${da}T${hr}:${mi}`
}

const NOTE_PRESETS = [
  'Call student & parent regarding batch timings and fee structure',
  'Share scholarship entrance test syllabus and sample paper on WhatsApp',
  'Confirm attendance for upcoming weekend demo lecture',
]

export function FollowUpModal({
  isOpen,
  onClose,
  onSuccess,
  leads,
  counsellors,
  userRole,
  currentUserId,
  actorName = 'Staff Member',
  preselectedLeadId,
}: FollowUpModalProps) {
  const { showToast } = useToast()

  const [leadId, setLeadId] = useState<string>('')
  const [dueAtLocal, setDueAtLocal] = useState<string>(() =>
    toLocalDateTimeInputValue(new Date(Date.now() + 2 * 3600 * 1000))
  )
  const [assignedTo, setAssignedTo] = useState<string>('')
  const [note, setNote] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  useEffect(() => {
    if (isOpen) {
      const defaultLeadId = preselectedLeadId || leads[0]?.id || ''
      setLeadId(defaultLeadId)
      setDueAtLocal(toLocalDateTimeInputValue(new Date(Date.now() + 2 * 3600 * 1000)))
      const matchedLead = leads.find((l) => l.id === defaultLeadId)
      setAssignedTo(matchedLead?.assigned_to || '')
      setNote('')
      setError(null)
    }
  }, [isOpen, preselectedLeadId, leads])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen) return null

  const applyQuickTimePreset = (offsetHours: number, tomorrowMorning = false) => {
    if (tomorrowMorning) {
      const d = new Date()
      d.setDate(d.getDate() + 1)
      d.setHours(10, 0, 0, 0)
      setDueAtLocal(toLocalDateTimeInputValue(d))
    } else {
      const d = new Date(Date.now() + offsetHours * 3600 * 1000)
      setDueAtLocal(toLocalDateTimeInputValue(d))
    }
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!leadId) {
      setError('Please select a student lead.')
      return
    }
    if (!dueAtLocal) {
      setError('Please select a due date and time.')
      return
    }
    const parsedDate = new Date(dueAtLocal)
    if (isNaN(parsedDate.getTime())) {
      setError('Invalid due date/time format.')
      return
    }
    if (!note.trim() || note.trim().length < 4) {
      setError('Please enter a follow-up action note (at least 4 characters).')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const created = await followUpsService.createFollowUp(
        {
          lead_id: leadId,
          assigned_to: assignedTo || null,
          due_at: parsedDate.toISOString(),
          note: note.trim(),
        },
        currentUserId,
        userRole,
        actorName
      )

      showToast(
        `Follow-up scheduled for ${created.lead_name || 'student'}`,
        'success'
      )
      onSuccess(created)
      onClose()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to schedule follow-up'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="crm-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="followup-modal-title"
      onClick={() => {
        if (!isSubmitting) onClose()
      }}
    >
      <div
        className="crm-modal-card lead-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="crm-modal-header">
          <div className="auth-header-title-box">
            <div className="auth-brand-badge">
              <CalendarClock size={20} className="text-primary-600" />
            </div>
            <div>
              <h2 id="followup-modal-title" className="crm-modal-title">
                Schedule Student Follow-Up
              </h2>
              <p className="crm-modal-subtitle">
                Set a timed callback or counselling reminder so no student enquiry is dropped.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="crm-modal-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="lead-modal-body">
          <form onSubmit={handleSubmit} className="crm-lead-form">
            {error && (
              <div className="auth-alert-banner alert-danger" style={{ margin: 0 }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Student Lead Selection */}
            <div className="form-field-group">
              <label htmlFor="fup-lead" className="form-label">
                Select Student Enquiry <span className="required-star">*</span>
              </label>
              <div className="input-with-icon">
                <User size={15} className="input-icon" />
                <select
                  id="fup-lead"
                  className="crm-input form-select"
                  value={leadId}
                  onChange={(e) => {
                    setLeadId(e.target.value)
                    const found = leads.find((l) => l.id === e.target.value)
                    if (found?.assigned_to) setAssignedTo(found.assigned_to)
                  }}
                  disabled={isSubmitting || Boolean(preselectedLeadId)}
                >
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.full_name} — {lead.course_interest} ({lead.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid: Due Date/Time & Assignee */}
            <div className="form-grid-2">
              <div className="form-field-group">
                <label htmlFor="fup-due" className="form-label">
                  Due Date & Time <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <Clock size={15} className="input-icon" />
                  <input
                    id="fup-due"
                    type="datetime-local"
                    className="crm-input"
                    value={dueAtLocal}
                    onChange={(e) => setDueAtLocal(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div className="fup-time-presets">
                  <button
                    type="button"
                    className="fup-preset-mini"
                    onClick={() => applyQuickTimePreset(2)}
                  >
                    +2 Hours
                  </button>
                  <button
                    type="button"
                    className="fup-preset-mini"
                    onClick={() => applyQuickTimePreset(0, true)}
                  >
                    Tomorrow 10 AM
                  </button>
                  <button
                    type="button"
                    className="fup-preset-mini"
                    onClick={() => applyQuickTimePreset(48)}
                  >
                    +2 Days
                  </button>
                  <button
                    type="button"
                    className="fup-preset-mini preset-overdue-test"
                    onClick={() => applyQuickTimePreset(-2)}
                    title="Set 2 hours in the past to test Overdue detection"
                  >
                    Test Overdue (-2h)
                  </button>
                </div>
              </div>

              <div className="form-field-group">
                <label htmlFor="fup-assignee" className="form-label">
                  Assigned Counsellor
                </label>
                <div className="input-with-icon">
                  <UserCheck size={15} className="input-icon" />
                  <select
                    id="fup-assignee"
                    className="crm-input form-select"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    disabled={isSubmitting || userRole === 'counsellor'}
                  >
                    <option value="">
                      {userRole === 'counsellor'
                        ? 'Assigned to You (Counsellor)'
                        : 'Default Lead Counsellor'}
                    </option>
                    {counsellors.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Follow-up Action Note */}
            <div className="form-field-group">
              <label htmlFor="fup-note" className="form-label">
                Follow-Up Action Note <span className="required-star">*</span>
              </label>
              <div className="fup-note-presets">
                {NOTE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className="fup-note-preset-btn"
                    onClick={() => {
                      setNote(preset)
                      setError(null)
                    }}
                    disabled={isSubmitting}
                  >
                    <Sparkles size={11} />
                    <span>{preset}</span>
                  </button>
                ))}
              </div>
              <div className="input-with-icon-top">
                <FileText size={15} className="input-icon-top" />
                <textarea
                  id="fup-note"
                  className="crm-input form-textarea"
                  rows={3}
                  placeholder="Describe what needs to be discussed or sent during this follow-up..."
                  value={note}
                  onChange={(e) => {
                    setNote(e.target.value)
                    if (error) setError(null)
                  }}
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-actions-row">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
              >
                Schedule Follow-Up
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
