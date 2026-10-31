import { useState, useEffect } from 'react'
import { X, AlertTriangle, AlertCircle, Tag } from 'lucide-react'
import type { Lead } from '../../types/leads'
import { Button } from '../../components/ui/Button'

export interface LostReasonModalProps {
  isOpen: boolean
  lead: Lead | null
  isSubmitting: boolean
  onClose: () => void
  onConfirm: (lostReason: string) => Promise<void>
}

const LOST_REASON_PRESETS = [
  'Fee / Budget Constraints',
  'Enrolled in Competitor Institute',
  'Batch Timing / Location Mismatch',
  'Dropped Exam / Changed Stream Plan',
  'Unreachable / Invalid Contact Number',
]

export function LostReasonModal({
  isOpen,
  lead,
  isSubmitting,
  onClose,
  onConfirm,
}: LostReasonModalProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && lead) {
      setReason(lead.lost_reason || '')
      setError(null)
    }
  }, [isOpen, lead])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen || !lead) return null

  const handleSelectPreset = (preset: string) => {
    setReason(preset)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = reason.trim()

    if (!trimmed) {
      setError('A Lost Reason is mandatory before marking an enquiry as Lost.')
      return
    }
    if (trimmed.length < 4) {
      setError('Please provide a clear reason (at least 4 characters).')
      return
    }

    setError(null)
    await onConfirm(trimmed)
  }

  return (
    <div
      className="crm-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lost-reason-modal-title"
      onClick={() => {
        if (!isSubmitting) onClose()
      }}
    >
      <div
        className="crm-modal-card lost-reason-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="crm-modal-header">
          <div className="auth-header-title-box">
            <div className="lost-reason-badge">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 id="lost-reason-modal-title" className="crm-modal-title">
                Record Mandatory Lost Reason
              </h2>
              <p className="crm-modal-subtitle">
                Required before transitioning <strong>{lead.full_name}</strong> ({lead.course_interest}) to{' '}
                <strong>LOST</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="crm-modal-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Cancel and close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="lost-reason-form">
          <div className="lost-presets-section">
            <span className="lost-presets-label">
              <Tag size={12} /> Quick Select Common Admissions Reason:
            </span>
            <div className="lost-presets-grid">
              {LOST_REASON_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`lost-preset-chip ${reason === preset ? 'active' : ''}`}
                  onClick={() => handleSelectPreset(preset)}
                  disabled={isSubmitting}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="form-field-group">
            <label htmlFor="lost-reason-input" className="form-label">
              Detailed Lost Reason / Outcome Notes <span className="required-star">*</span>
            </label>
            <textarea
              id="lost-reason-input"
              className={`crm-input lost-reason-textarea ${error ? 'input-error' : ''}`}
              rows={3}
              placeholder="Select a preset above or describe why this student enquiry did not convert..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (error) setError(null)
              }}
              disabled={isSubmitting}
              autoFocus
            />
            {error && (
              <span className="form-error-text">
                <AlertCircle size={12} /> {error}
              </span>
            )}
          </div>

          <div className="form-actions-row">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel (Keep {lead.status})
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="md"
              isLoading={isSubmitting}
            >
              Confirm & Mark as Lost
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
