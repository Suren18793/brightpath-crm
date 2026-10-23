import type { LucideIcon } from 'lucide-react'

export type NavTab = 'dashboard' | 'leads' | 'followups' | 'reports' | 'settings'

export interface NavItem {
  id: NavTab
  label: string
  icon: LucideIcon
  badgeCount?: number
}
