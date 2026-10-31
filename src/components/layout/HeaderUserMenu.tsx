import { useState, useRef, useEffect } from 'react'
import {
  ChevronDown,
  UserCheck,
  Shield,
  Briefcase,
  GraduationCap,
  LogIn,
  LogOut,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../types/auth'

export function HeaderUserMenu() {
  const {
    user,
    profile,
    role,
    isWorkshopMode,
    switchWorkshopRole,
    openAuthModal,
    signOut,
  } = useAuth()

  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const displayName = profile?.full_name || (user?.email ? user.email.split('@')[0] : 'Staff Member')
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleRoleSelect = (newRole: UserRole) => {
    switchWorkshopRole(newRole)
    setIsOpen(false)
  }

  const handleSignInClick = () => {
    setIsOpen(false)
    openAuthModal('signin')
  }

  const handleSignOutClick = async () => {
    setIsOpen(false)
    await signOut()
  }

  const roleMeta: Record<
    UserRole,
    { label: string; icon: typeof UserCheck; badgeColor: string; description: string }
  > = {
    counsellor: {
      label: 'Counsellor',
      icon: GraduationCap,
      badgeColor: 'var(--status-converted-text)',
      description: 'Access assigned leads & follow-ups',
    },
    manager: {
      label: 'Team Manager',
      icon: Briefcase,
      badgeColor: 'var(--primary-600)',
      description: 'View all leads, reassign & team reports',
    },
    admin: {
      label: 'Administrator',
      icon: Shield,
      badgeColor: '#6d28d9',
      description: 'Full institute access & settings',
    },
  }

  const currentRoleMeta = roleMeta[role] || roleMeta.counsellor

  return (
    <div className="header-user-menu-wrapper" ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        className={`header-user-menu-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="User profile and role menu"
      >
        <div className="avatar-circle">{initials}</div>
        <div className="user-info-text">
          <div className="user-name-line">
            <span className="user-name">{displayName}</span>
            {isWorkshopMode && (
              <span className="workshop-tag" title="Local demo role active">
                Demo
              </span>
            )}
          </div>
          <span
            className="user-role-pill"
            style={{ color: currentRoleMeta.badgeColor, display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <currentRoleMeta.icon size={11} />
            {currentRoleMeta.label}
          </span>
        </div>
        <ChevronDown size={14} className={`menu-chevron ${isOpen ? 'rotate' : ''}`} />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="header-user-dropdown" role="menu">
          {/* User Details Header */}
          <div className="dropdown-user-header">
            <div className="dropdown-avatar">{initials}</div>
            <div className="dropdown-user-meta">
              <span className="dropdown-user-name">{displayName}</span>
              <span className="dropdown-user-email">
                {user?.email || (isWorkshopMode ? 'workshop-preview@brightpath.edu' : 'Active Account')}
              </span>
              <div className="dropdown-role-row">
                <span className="dropdown-role-badge" style={{ color: currentRoleMeta.badgeColor }}>
                  <currentRoleMeta.icon size={12} />
                  {currentRoleMeta.label}
                </span>
                <span className="dropdown-role-scope">{currentRoleMeta.description}</span>
              </div>
            </div>
          </div>

          <div className="dropdown-divider" />

          {/* Workshop Role Switcher */}
          <div className="dropdown-section">
            <div className="dropdown-section-title">
              <Sparkles size={12} className="text-primary-600" />
              <span>Switch Preview Role</span>
            </div>
            <div className="dropdown-role-switcher-grid">
              {(['counsellor', 'manager', 'admin'] as UserRole[]).map((r) => {
                const meta = roleMeta[r]
                const isCurrent = role === r
                return (
                  <button
                    key={r}
                    type="button"
                    className={`role-select-chip ${isCurrent ? 'selected' : ''}`}
                    onClick={() => handleRoleSelect(r)}
                  >
                    <meta.icon size={14} style={{ color: meta.badgeColor }} />
                    <div className="chip-text">
                      <strong>{meta.label}</strong>
                      <small>{r === 'counsellor' ? 'My Leads' : r === 'manager' ? 'All Leads' : 'Full Access'}</small>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="dropdown-divider" />

          {/* Actions */}
          <div className="dropdown-actions-list">
            {user ? (
              <button
                type="button"
                className="dropdown-action-item danger"
                onClick={handleSignOutClick}
              >
                <LogOut size={15} />
                <span>Sign Out ({user.email})</span>
              </button>
            ) : (
              <button
                type="button"
                className="dropdown-action-item primary"
                onClick={handleSignInClick}
              >
                <LogIn size={15} />
                <span>Sign In with Supabase Account</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
