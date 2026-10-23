import { Menu, Search, UserCheck } from 'lucide-react'
import type { NavTab } from '../../types/navigation'
import { Button } from '../ui/Button'

export interface HeaderProps {
  activeTab: NavTab
  onToggleMobileMenu: () => void
  userRole?: 'admin' | 'manager' | 'counsellor'
  userName?: string
  onQuickNewLead?: () => void
}

export function Header({
  activeTab,
  onToggleMobileMenu,
  userRole = 'counsellor',
  userName = 'Priya Sharma',
  onQuickNewLead,
}: HeaderProps) {
  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Academy Dashboard',
      subtitle: 'Overview of enquiries, follow-ups, and conversion metrics',
    },
    leads: {
      title: 'Leads & Enquiries',
      subtitle: 'Manage prospective students, intake status, and assignments',
    },
    followups: {
      title: 'Follow-up Scheduler',
      subtitle: 'Track pending student calls, meetings, and overdue alerts',
    },
    reports: {
      title: 'Performance Reports',
      subtitle: 'Source effectiveness, counselor workload, and admissions rate',
    },
    settings: {
      title: 'System Settings',
      subtitle: 'Institute profile, staff roles, and database connection',
    },
  }

  const currentMeta = titles[activeTab] || titles.dashboard

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="mobile-menu-trigger"
          onClick={onToggleMobileMenu}
          aria-label="Open mobile menu"
        >
          <Menu size={22} />
        </button>

        <div className="header-title-box">
          <h1 className="header-title">{currentMeta.title}</h1>
          <span className="header-breadcrumb">{currentMeta.subtitle}</span>
        </div>
      </div>

      <div className="header-right">
        <div className="header-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="search"
            className="header-search-input"
            placeholder="Search leads, phone..."
            aria-label="Quick search"
          />
        </div>

        {onQuickNewLead && (
          <Button
            size="sm"
            variant="primary"
            onClick={onQuickNewLead}
          >
            + New Lead
          </Button>
        )}

        <div className="user-profile-badge">
          <div className="avatar-circle">
            {userName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="user-info-text">
            <span className="user-name">{userName}</span>
            <span className="user-role-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
              <UserCheck size={10} />
              {userRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
