import { useState, type FormEvent } from 'react'
import { Menu, Search } from 'lucide-react'
import type { NavTab } from '../../types/navigation'
import { Button } from '../ui/Button'
import { HeaderUserMenu } from './HeaderUserMenu'

export interface HeaderProps {
  activeTab: NavTab
  onToggleMobileMenu: () => void
  onQuickNewLead?: () => void
  onQuickSearch?: (query: string) => void
}

export function Header({
  activeTab,
  onToggleMobileMenu,
  onQuickNewLead,
  onQuickSearch,
}: HeaderProps) {
  const [searchText, setSearchText] = useState('')

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

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (onQuickSearch) {
      onQuickSearch(searchText.trim())
    }
  }

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="mobile-menu-trigger"
          onClick={onToggleMobileMenu}
          aria-label="Open mobile navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="header-title-box">
          <h1 className="header-title">{currentMeta.title}</h1>
          <span className="header-breadcrumb">{currentMeta.subtitle}</span>
        </div>
      </div>

      <div className="header-right">
        <form
          className="header-search-box"
          role="search"
          onSubmit={handleSearchSubmit}
        >
          <Search size={16} className="search-icon" aria-hidden="true" />
          <input
            type="search"
            className="header-search-input"
            placeholder="Search leads, phone... (Enter)"
            aria-label="Quick search student leads by name, phone, or email"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </form>

        {onQuickNewLead && (
          <Button
            size="sm"
            variant="primary"
            onClick={onQuickNewLead}
            aria-label="Create new student lead"
          >
            + New Lead
          </Button>
        )}

        <HeaderUserMenu />
      </div>
    </header>
  )
}
