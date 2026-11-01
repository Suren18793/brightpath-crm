import {
  GraduationCap,
  LayoutDashboard,
  Users,
  CalendarClock,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { NavItem, NavTab } from '../../types/navigation'
import { configStatus } from '../../lib/supabaseClient'

export interface SidebarProps {
  activeTab: NavTab
  onSelectTab: (tab: NavTab) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  unreadFollowupsCount?: number
}

export function Sidebar({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  unreadFollowupsCount = 3,
}: SidebarProps) {
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

  return (
    <aside
      className={`app-sidebar ${isCollapsed ? 'collapsed' : ''}`}
      aria-label="Primary Sidebar Navigation"
    >
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon-box" aria-hidden="true">
            <GraduationCap size={20} />
          </div>
          {!isCollapsed && <span>BrightPath CRM</span>}
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="CRM Sections">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              type="button"
              className={`nav-link ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} aria-hidden="true" />
              {!isCollapsed && <span>{item.label}</span>}
              {!isCollapsed && item.badgeCount !== undefined && item.badgeCount > 0 && (
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
      </nav>

      <div className="sidebar-footer">
        {!isCollapsed && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              fontSize: '0.75rem',
              color: '#cbd5e1',
            }}
          >
            <span
              className={`beacon-dot ${
                configStatus.isConfigured ? 'beacon-emerald' : 'beacon-amber'
              }`}
              style={{ width: 8, height: 8 }}
              aria-hidden="true"
            />
            <span style={{ fontWeight: 500 }}>
              {configStatus.isConfigured ? 'Supabase Connected' : 'Demo Mode (Unlinked)'}
            </span>
          </div>
        )}

        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!isCollapsed && <span style={{ fontSize: '0.8rem' }}>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
