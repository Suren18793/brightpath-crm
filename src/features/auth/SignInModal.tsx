import React, { useState, useEffect } from 'react'
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { configStatus } from '../../lib/supabaseClient'
import { Button } from '../../components/ui/Button'
import type { UserRole } from '../../types/auth'

export function SignInModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    openAuthModal,
    signIn,
    signUp,
    switchWorkshopRole,
    error: authError,
  } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [successNotice, setSuccessNotice] = useState<string | null>(null)

  // Reset fields when opening modal or changing mode
  useEffect(() => {
    if (isAuthModalOpen) {
      setLocalError(null)
      setSuccessNotice(null)
    }
  }, [isAuthModalOpen, authModalMode])

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAuthModalOpen, closeAuthModal])

  if (!isAuthModalOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    setSuccessNotice(null)

    if (!email.trim()) {
      setLocalError('Please enter a valid email address.')
      return
    }

    if (!password || password.length < 6) {
      setLocalError('Password must be at least 6 characters.')
      return
    }

    if (authModalMode === 'signup' && !fullName.trim()) {
      setLocalError('Please provide your full staff name.')
      return
    }

    setIsSubmitting(true)

    try {
      if (authModalMode === 'signin') {
        const { error } = await signIn(email.trim(), password)
        if (error) {
          setLocalError(error.message)
        }
      } else {
        const res = await signUp(email.trim(), password, fullName.trim())
        if (res.error) {
          setLocalError(res.error.message)
        } else if (res.requiresEmailConfirmation) {
          setSuccessNotice(
            'Confirmation link sent! Please check your inbox or confirm in your Supabase Auth dashboard.'
          )
        }
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Authentication request failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePreFill = (demoEmail: string, demoRole: UserRole, demoName: string) => {
    setEmail(demoEmail)
    setPassword('BrightPathDemo2025!')
    setFullName(demoName)
    setLocalError(null)
    setSuccessNotice(null)
  }

  const handleDirectDemoSwitch = (role: UserRole) => {
    switchWorkshopRole(role)
    closeAuthModal()
  }

  return (
    <div
      className="crm-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={closeAuthModal}
    >
      <div
        className="crm-modal-card auth-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="crm-modal-header">
          <div className="auth-header-title-box">
            <div className="auth-brand-badge">
              <ShieldCheck size={20} className="text-primary-600" />
            </div>
            <div>
              <h2 id="auth-modal-title" className="crm-modal-title">
                {authModalMode === 'signin' ? 'Staff Authentication' : 'Create Staff Account'}
              </h2>
              <p className="crm-modal-subtitle">
                BrightPath Academy Education CRM — Secure Workspace
              </p>
            </div>
          </div>
          <button
            type="button"
            className="crm-modal-close-btn"
            onClick={closeAuthModal}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Toggle: Sign In vs Sign Up */}
        <div className="auth-mode-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${authModalMode === 'signin' ? 'active' : ''}`}
            onClick={() => openAuthModal('signin')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${authModalMode === 'signup' ? 'active' : ''}`}
            onClick={() => openAuthModal('signup')}
          >
            Register Account
          </button>
        </div>

        {/* Supabase Status Pill */}
        <div className="auth-connection-status">
          <span
            className={`status-indicator-dot ${
              configStatus.isConfigured ? 'status-connected' : 'status-demo'
            }`}
          />
          <span className="status-label">
            {configStatus.isConfigured
              ? 'Connected to Supabase Project'
              : 'Supabase credentials not set — running in Demo / Workshop Mode'}
          </span>
        </div>

        {/* Error / Success Banners */}
        {(localError || authError) && (
          <div className="auth-alert-banner alert-danger">
            <AlertCircle size={16} />
            <span>{localError || authError}</span>
          </div>
        )}

        {successNotice && (
          <div className="auth-alert-banner alert-success">
            <CheckCircle2 size={16} />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {authModalMode === 'signup' && (
            <div className="form-group">
              <label htmlFor="auth-fullname" className="form-label">
                Full Staff Name <span className="text-danger">*</span>
              </label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  id="auth-fullname"
                  type="text"
                  className="crm-input"
                  placeholder="e.g. Priya Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email" className="form-label">
              Staff Email Address <span className="text-danger">*</span>
            </label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                id="auth-email"
                type="email"
                className="crm-input"
                placeholder="name@brightpath.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus={authModalMode === 'signin'}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="auth-password" className="form-label">
              Password <span className="text-danger">*</span>
            </label>
            <div className="input-with-icon password-input-wrap">
              <Lock size={16} className="input-icon" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                className="crm-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            className="auth-submit-btn"
          >
            {authModalMode === 'signin' ? 'Sign In to Dashboard' : 'Register New Staff Profile'}
          </Button>
        </form>

        {/* Quick Demo Pre-fill section */}
        <div className="auth-demo-divider">
          <span>Workshop Demo Presets</span>
        </div>

        <div className="demo-accounts-grid">
          <div className="demo-account-chip">
            <div className="demo-chip-info">
              <strong>Priya Sharma</strong>
              <span>Counsellor</span>
            </div>
            <div className="demo-chip-actions">
              <button
                type="button"
                className="demo-action-btn"
                onClick={() => handlePreFill('priya.brightpath@gmail.com', 'counsellor', 'Priya Sharma')}
                title="Fill credentials into form"
              >
                Fill
              </button>
              <button
                type="button"
                className="demo-action-btn direct"
                onClick={() => handleDirectDemoSwitch('counsellor')}
                title="Instantly switch active role to Counsellor"
              >
                <Sparkles size={12} /> Switch
              </button>
            </div>
          </div>

          <div className="demo-account-chip">
            <div className="demo-chip-info">
              <strong>Aarav Patel</strong>
              <span>Manager</span>
            </div>
            <div className="demo-chip-actions">
              <button
                type="button"
                className="demo-action-btn"
                onClick={() => handlePreFill('aarav.brightpath@gmail.com', 'manager', 'Aarav Patel')}
                title="Fill credentials into form"
              >
                Fill
              </button>
              <button
                type="button"
                className="demo-action-btn direct"
                onClick={() => handleDirectDemoSwitch('manager')}
                title="Instantly switch active role to Manager"
              >
                <Sparkles size={12} /> Switch
              </button>
            </div>
          </div>

          <div className="demo-account-chip">
            <div className="demo-chip-info">
              <strong>Dr. Ramesh Nair</strong>
              <span>Admin / Director</span>
            </div>
            <div className="demo-chip-actions">
              <button
                type="button"
                className="demo-action-btn"
                onClick={() =>
                  handlePreFill('ramesh.brightpath@gmail.com', 'admin', 'Dr. Ramesh Nair')
                }
                title="Fill credentials into form"
              >
                Fill
              </button>
              <button
                type="button"
                className="demo-action-btn direct"
                onClick={() => handleDirectDemoSwitch('admin')}
                title="Instantly switch active role to Admin"
              >
                <Sparkles size={12} /> Switch
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
