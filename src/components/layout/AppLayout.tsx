import { useState, type ReactNode } from 'react'
import type { NavTab } from '../../types/navigation'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'

export interface AppLayoutProps {
  activeTab: NavTab
  onSelectTab: (tab: NavTab) => void
  userRole?: 'admin' | 'manager' | 'counsellor'
  userName?: string
  unreadFollowupsCount?: number
  onQuickNewLead?: () => void
  onQuickSearch?: (query: string) => void
  children: ReactNode
}

export function AppLayout({
  activeTab,
  onSelectTab,
  unreadFollowupsCount = 3,
  onQuickNewLead,
  onQuickSearch,
  children,
}: AppLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="app-container">
      {/* WCAG Skip-to-Content Keyboard Shortcut */}
      <a href="#main-content" className="skip-to-content-link">
        Skip to main content
      </a>

      {/* Desktop Persistent Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        unreadFollowupsCount={unreadFollowupsCount}
      />

      {/* Mobile Drawer */}
      <MobileNav
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        unreadFollowupsCount={unreadFollowupsCount}
        onQuickNewLead={onQuickNewLead}
      />

      {/* Main Viewport */}
      <div className={`app-main ${isCollapsed ? 'collapsed' : ''}`}>
        <Header
          activeTab={activeTab}
          onToggleMobileMenu={() => setIsMobileOpen(true)}
          onQuickNewLead={onQuickNewLead}
          onQuickSearch={onQuickSearch}
        />

        <main id="main-content" className="app-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  )
}
