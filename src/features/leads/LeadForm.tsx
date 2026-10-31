import React, { useState, useEffect } from 'react'
import {
  User,
  Phone,
  Mail,
  GraduationCap,
  Radio,
  UserCheck,
  FileText,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import type { LeadSource } from '../../types/leads'
import { ACADEMY_COURSES } from '../../types/leads'
import type { UserRole } from '../../types/auth'
import { validateLeadForm, type LeadFormData, type FormErrors } from '../../utils/validation'
import { Button } from '../../components/ui/Button'

export interface LeadFormProps {
  initialData?: Partial<LeadFormData>
  onSubmit: (data: LeadFormData) => Promise<void>
  onCancel: () => void
  counsellors: { id: string; full_name: string }[]
  userRole: UserRole
  isSubmitting: boolean
  mode: 'create' | 'edit'
}

const SOURCES: LeadSource[] = [
  'Website',
  'Phone Call',
  'WhatsApp',
  'Referral',
  'Walk-in',
  'Other',
]

export function LeadForm({
  initialData,
  onSubmit,
  onCancel,
  counsellors,
  userRole,
  isSubmitting,
  mode,
}: LeadFormProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    full_name: initialData?.full_name || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    course_interest: initialData?.course_interest || ACADEMY_COURSES[0],
    source: initialData?.source || 'Website',
    assigned_to: initialData?.assigned_to || '',
    notes: initialData?.notes || '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }))
    }
  }, [initialData])

  const handleChange = (
    field: keyof LeadFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear specific field error on change if already touched
    if (touched[field]) {
      const result = validateLeadForm({
        ...formData,
        [field]: value,
      })
      setErrors((prev) => ({
        ...prev,
        [field]: result.errors[field],
      }))
    }
  }

  const handleBlur = (field: keyof LeadFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const result = validateLeadForm(formData)
    setErrors((prev) => ({
      ...prev,
      [field]: result.errors[field],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all as touched
    setTouched({
      full_name: true,
      phone: true,
      email: true,
      course_interest: true,
      source: true,
      assigned_to: true,
      notes: true,
    })

    const result = validateLeadForm(formData)
    setErrors(result.errors)

    if (!result.isValid) {
      return
    }

    await onSubmit(formData)
  }

  const handleQuickFillPreset = () => {
    const samples = [
      {
        full_name: 'Aditi Deshmukh',
        phone: '+91 98202 54321',
        email: 'aditi.deshmukh@gmail.com',
        course_interest: 'JEE Advanced Masterclass',
        source: 'Website' as LeadSource,
        notes: 'Inquired for Class 11 two-year integrated classroom program. Scored 96% in 10th ICSE boards.',
      },
      {
        full_name: 'Rahul Sen',
        phone: '+91 98310 99887',
        email: 'rahul.sen@example.com',
        course_interest: 'Full Stack Web Development (MERN)',
        source: 'WhatsApp' as LeadSource,
        notes: 'Final year BCA student looking for hands-on full stack placement assistance track.',
      },
      {
        full_name: 'Neha Chawla',
        phone: '+91 97115 12345',
        email: 'neha.chawla@outlook.com',
        course_interest: 'NEET Comprehensive Medical',
        source: 'Walk-in' as LeadSource,
        notes: 'Visited campus with mother. Interested in biology revision and all-India test series.',
      },
    ]

    const picked = samples[Math.floor(Math.random() * samples.length)]
    setFormData((prev) => ({
      ...prev,
      ...picked,
    }))
    setErrors({})
  }

  return (
    <form onSubmit={handleSubmit} className="crm-lead-form">
      {/* Quick Fill Sample Helper (Only in Create Mode) */}
      {mode === 'create' && (
        <div className="form-quickfill-row">
          <span className="quickfill-text">Testing the CRM?</span>
          <button
            type="button"
            className="quickfill-btn"
            onClick={handleQuickFillPreset}
            disabled={isSubmitting}
          >
            <Sparkles size={12} />
            <span>1-Click Fill Sample Student</span>
          </button>
        </div>
      )}

      {/* Grid: Full Name & Phone */}
      <div className="form-grid-2">
        <div className="form-field-group">
          <label htmlFor="lead-fullname" className="form-label">
            Student Full Name <span className="required-star">*</span>
          </label>
          <div className="input-with-icon">
            <User size={15} className="input-icon" />
            <input
              id="lead-fullname"
              type="text"
              className={`crm-input ${errors.full_name ? 'input-error' : ''}`}
              placeholder="e.g. Ananya Deshmukh"
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              onBlur={() => handleBlur('full_name')}
              disabled={isSubmitting}
              autoFocus
            />
          </div>
          {errors.full_name && (
            <span className="form-error-text">
              <AlertCircle size={12} /> {errors.full_name}
            </span>
          )}
        </div>

        <div className="form-field-group">
          <label htmlFor="lead-phone" className="form-label">
            Contact Phone <span className="required-star">*</span>
          </label>
          <div className="input-with-icon">
            <Phone size={15} className="input-icon" />
            <input
              id="lead-phone"
              type="tel"
              className={`crm-input ${errors.phone ? 'input-error' : ''}`}
              placeholder="+91 98201 12345"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              disabled={isSubmitting}
            />
          </div>
          {errors.phone && (
            <span className="form-error-text">
              <AlertCircle size={12} /> {errors.phone}
            </span>
          )}
        </div>
      </div>

      {/* Grid: Email & Course Interest */}
      <div className="form-grid-2">
        <div className="form-field-group">
          <label htmlFor="lead-email" className="form-label">
            Email Address <span className="optional-tag">(Optional)</span>
          </label>
          <div className="input-with-icon">
            <Mail size={15} className="input-icon" />
            <input
              id="lead-email"
              type="email"
              className={`crm-input ${errors.email ? 'input-error' : ''}`}
              placeholder="student@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              disabled={isSubmitting}
            />
          </div>
          {errors.email && (
            <span className="form-error-text">
              <AlertCircle size={12} /> {errors.email}
            </span>
          )}
        </div>

        <div className="form-field-group">
          <label htmlFor="lead-course" className="form-label">
            Course of Interest <span className="required-star">*</span>
          </label>
          <div className="input-with-icon">
            <GraduationCap size={15} className="input-icon" />
            <select
              id="lead-course"
              className={`crm-input form-select ${errors.course_interest ? 'input-error' : ''}`}
              value={formData.course_interest}
              onChange={(e) => handleChange('course_interest', e.target.value)}
              onBlur={() => handleBlur('course_interest')}
              disabled={isSubmitting}
            >
              {ACADEMY_COURSES.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>
          {errors.course_interest && (
            <span className="form-error-text">
              <AlertCircle size={12} /> {errors.course_interest}
            </span>
          )}
        </div>
      </div>

      {/* Grid: Acquisition Source & Assignee */}
      <div className="form-grid-2">
        <div className="form-field-group">
          <label htmlFor="lead-source" className="form-label">
            Acquisition Channel / Source <span className="required-star">*</span>
          </label>
          <div className="input-with-icon">
            <Radio size={15} className="input-icon" />
            <select
              id="lead-source"
              className={`crm-input form-select ${errors.source ? 'input-error' : ''}`}
              value={formData.source}
              onChange={(e) => handleChange('source', e.target.value as LeadSource)}
              onBlur={() => handleBlur('source')}
              disabled={isSubmitting}
            >
              {SOURCES.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>
          {errors.source && (
            <span className="form-error-text">
              <AlertCircle size={12} /> {errors.source}
            </span>
          )}
        </div>

        <div className="form-field-group">
          <label htmlFor="lead-assignee" className="form-label">
            Assigned Counsellor
          </label>
          <div className="input-with-icon">
            <UserCheck size={15} className="input-icon" />
            <select
              id="lead-assignee"
              className="crm-input form-select"
              value={formData.assigned_to}
              onChange={(e) => handleChange('assigned_to', e.target.value)}
              disabled={isSubmitting || userRole === 'counsellor'}
            >
              <option value="">
                {userRole === 'counsellor' ? 'Assigned to You (Counsellor)' : 'Auto-assign / Unassigned'}
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

      {/* Notes */}
      <div className="form-field-group">
        <label htmlFor="lead-notes" className="form-label">
          Counselling & Academic Background Notes <span className="optional-tag">(Optional)</span>
        </label>
        <div className="input-with-icon-top">
          <FileText size={15} className="input-icon-top" />
          <textarea
            id="lead-notes"
            className={`crm-input form-textarea ${errors.notes ? 'input-error' : ''}`}
            rows={3}
            placeholder="e.g. Target exam year, past mock scores, parent contact preferences, scholarship eligibility..."
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            onBlur={() => handleBlur('notes')}
            disabled={isSubmitting}
          />
        </div>
        {errors.notes && (
          <span className="form-error-text">
            <AlertCircle size={12} /> {errors.notes}
          </span>
        )}
      </div>

      {/* Form Action Buttons */}
      <div className="form-actions-row">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onCancel}
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
          {mode === 'create' ? 'Create Student Lead' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
