import {
  GraduationCap,
  LayoutDashboard,
  Users,
  CalendarClock,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Database,
} from 'lucide-react'
import type { NavItem, NavTab } from '../../types/navigation'

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
    <aside className={`app-sidebar ${isCollapsed ? 'collapsed' : ''}`} aria-label="Main Navigation">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon-box" aria-hidden="true">
            <GraduationCap size={20} />
          </div>
          {!isCollapsed && <span>BrightPath CRM</span>}
        </div>
      </div>

      <nav className="sidebar-nav">
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
            >
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              {!isCollapsed && <span>{item.label}</span>}
              {!isCollapsed && item.badgeCount !== undefined && item.badgeCount > 0 && (
                <span className="nav-link-badge">{item.badgeCount}</span>
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
              padding: '0.4rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              fontSize: '0.75rem',
              color: '#94a3b8',
            }}
          >
            <Database size={14} color="#3b82f6" />
            <span>Supabase Ready</span>
          </div>
        )}

        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!isCollapsed && <span style={{ fontSize: '0.8rem' }}>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
