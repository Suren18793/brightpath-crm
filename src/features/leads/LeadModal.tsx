import { useState, useEffect } from 'react'
import { X, UserPlus, Edit3, AlertCircle } from 'lucide-react'
import type { Lead } from '../../types/leads'
import type { UserRole } from '../../types/auth'
import type { LeadFormData } from '../../utils/validation'
import { leadsService } from '../../services/leadsService'
import { useToast } from '../../context/ToastContext'
import { LeadForm } from './LeadForm'

export interface LeadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (lead: Lead) => void
  counsellors: { id: string; full_name: string }[]
  userRole: UserRole
  currentUserId?: string | null
  leadToEdit?: Lead | null
}

export function LeadModal({
  isOpen,
  onClose,
  onSuccess,
  counsellors,
  userRole,
  currentUserId,
  leadToEdit,
}: LeadModalProps) {
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const mode = leadToEdit ? 'edit' : 'create'

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const initialFormData: Partial<LeadFormData> | undefined = leadToEdit
    ? {
        full_name: leadToEdit.full_name,
        phone: leadToEdit.phone,
        email: leadToEdit.email || '',
        course_interest: leadToEdit.course_interest,
        source: leadToEdit.source,
        assigned_to: leadToEdit.assigned_to || '',
        notes: leadToEdit.notes || '',
      }
    : undefined

  const handleSubmit = async (formData: LeadFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      if (mode === 'create') {
        const created = await leadsService.createLead(
          {
            full_name: formData.full_name,
            phone: formData.phone,
            email: formData.email || null,
            course_interest: formData.course_interest,
            source: formData.source,
            status: 'New',
            assigned_to: formData.assigned_to || null,
            notes: formData.notes || null,
          },
          currentUserId,
          userRole
        )

        showToast(`Lead for "${created.full_name}" captured successfully!`, 'success')
        onSuccess(created)
        onClose()
      } else if (leadToEdit) {
        const updated = await leadsService.updateLead(
          leadToEdit.id,
          {
            full_name: formData.full_name,
            phone: formData.phone,
            email: formData.email || null,
            course_interest: formData.course_interest,
            source: formData.source,
            assigned_to: formData.assigned_to || null,
            notes: formData.notes || null,
          },
          currentUserId
        )

        showToast(`Updated student enquiry for "${updated.full_name}"`, 'success')
        onSuccess(updated)
        onClose()
      }
    } catch (err) {
      console.error('[LeadModal] Submission failed:', err)
      setSubmitError(
        err instanceof Error ? err.message : 'An unexpected error occurred while saving the lead.'
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
      aria-labelledby="lead-modal-title"
      onClick={onClose}
    >
      <div
        className="crm-modal-card lead-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="crm-modal-header">
          <div className="auth-header-title-box">
            <div className="auth-brand-badge">
              {mode === 'create' ? (
                <UserPlus size={20} className="text-primary-600" />
              ) : (
                <Edit3 size={20} className="text-primary-600" />
              )}
            </div>
            <div>
              <h2 id="lead-modal-title" className="crm-modal-title">
                {mode === 'create' ? 'Capture New Student Enquiry' : 'Edit Student Enquiry'}
              </h2>
              <p className="crm-modal-subtitle">
                {mode === 'create'
                  ? 'Add a prospective student enquiry into the admissions intake pipeline.'
                  : `Update enquiry details and counselor notes for ${leadToEdit?.full_name}.`}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="crm-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Global Error Banner */}
        {submitError && (
          <div className="auth-alert-banner alert-danger" style={{ margin: '1rem 1.5rem 0' }}>
            <AlertCircle size={16} />
            <span>{submitError}</span>
          </div>
        )}

        {/* Modal Form Body */}
        <div className="lead-modal-body">
          <LeadForm
            initialData={initialFormData}
            onSubmit={handleSubmit}
            onCancel={onClose}
            counsellors={counsellors}
            userRole={userRole}
            isSubmitting={isSubmitting}
            mode={mode}
          />
        </div>
      </div>
    </div>
  )
}
