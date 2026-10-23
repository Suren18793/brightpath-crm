import {
  GraduationCap,
  LayoutDashboard,
  Users,
  CalendarClock,
  BarChart3,
  Settings,
  X,
} from 'lucide-react'
import type { NavItem, NavTab } from '../../types/navigation'

export interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
  activeTab: NavTab
  onSelectTab: (tab: NavTab) => void
  unreadFollowupsCount?: number
}

export function MobileNav({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  unreadFollowupsCount = 3,
}: MobileNavProps) {
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
      >
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon-box">
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
              >
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{item.label}</span>
                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span className="nav-link-badge">{item.badgeCount}</span>
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
