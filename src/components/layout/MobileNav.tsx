import { useEffect } from 'react'
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  CalendarClock,
  BarChart3,
  Settings,
  UserPlus,
  X,
} from 'lucide-react'
import type { NavItem, NavTab } from '../../types/navigation'

export interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
  activeTab: NavTab
  onSelectTab: (tab: NavTab) => void
  unreadFollowupsCount?: number
  onQuickNewLead?: () => void
}

export function MobileNav({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  unreadFollowupsCount = 3,
  onQuickNewLead,
}: MobileNavProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads & Enquiries', icon: Users },
    {
      id: 'followups',
      label: 'Follow-ups',
      icon: CalendarClock,
      badgeCount: unreadFollowupsCount,
    },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const handleSelect = (tab: NavTab) => {
    onSelectTab(tab)
    onClose()
  }

  return (
    <>
      <div
        className={`mobile-nav-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <nav
        className={`mobile-nav-drawer ${isOpen ? 'open' : ''}`}
        aria-label="Mobile Navigation Drawer"
        aria-hidden={!isOpen}
      >
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon-box" aria-hidden="true">
              <GraduationCap size={20} />
            </div>
            <span>BrightPath CRM</span>
          </div>
          <button
            type="button"
            className="mobile-menu-trigger"
            onClick={onClose}
            aria-label="Close navigation menu"
            style={{ color: '#ffffff', display: 'flex' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                type="button"
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={() => handleSelect(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} aria-hidden="true" />
                <span>{item.label}</span>
                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span
                    className="nav-link-badge"
                    aria-label={`${item.badgeCount} overdue follow-ups`}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {onQuickNewLead && (
          <div className="sidebar-footer">
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', minHeight: 44 }}
              onClick={() => {
                onClose()
                onQuickNewLead()
              }}
            >
              <UserPlus size={16} aria-hidden="true" />
              <span>+ New Student Lead</span>
            </button>
          </div>
        )}
      </nav>
    </>
  )
}
