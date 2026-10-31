import type { LeadSource } from '../types/leads'

export interface LeadFormData {
  full_name: string
  phone: string
  email: string
  course_interest: string
  source: LeadSource
  assigned_to: string
  notes: string
}

export interface FormErrors {
  full_name?: string
  phone?: string
  email?: string
  course_interest?: string
  source?: string
  assigned_to?: string
  notes?: string
}

/**
 * Validates international & Indian phone numbers (7 to 15 digits, optional leading +)
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s()-]/g, '')
  // Accepts e.g. +919820112345, 9820112345, 09820112345, +14155552671
  const phoneRegex = /^\+?[0-9]{7,15}$/
  return phoneRegex.test(cleaned)
}

/**
 * Standard RFC-compliant email validator
 */
export function isValidEmail(email: string): boolean {
  if (!email.trim()) return true // Email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Comprehensive lead form validation
 */
export function validateLeadForm(data: LeadFormData): {
  isValid: boolean
  errors: FormErrors
} {
  const errors: FormErrors = {}

  // 1. Full Name
  const trimmedName = data.full_name.trim()
  if (!trimmedName) {
    errors.full_name = 'Student full name is required'
  } else if (trimmedName.length < 2) {
    errors.full_name = 'Name must be at least 2 characters long'
  } else if (trimmedName.length > 100) {
    errors.full_name = 'Name cannot exceed 100 characters'
  }

  // 2. Phone Number
  const trimmedPhone = data.phone.trim()
  if (!trimmedPhone) {
    errors.phone = 'Phone number is required'
  } else if (!isValidPhone(trimmedPhone)) {
    errors.phone = 'Please enter a valid phone number (e.g. +91 98201 12345 or 9820112345)'
  }

  // 3. Email Address (Optional)
  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address (e.g. student@example.com)'
  }

  // 4. Course Interest
  if (!data.course_interest || !data.course_interest.trim()) {
    errors.course_interest = 'Please select a course of interest'
  }

  // 5. Source
  if (!data.source) {
    errors.source = 'Please select an enquiry acquisition source'
  }

  // 6. Notes (Optional)
  if (data.notes && data.notes.length > 1000) {
    errors.notes = 'Notes cannot exceed 1000 characters'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
