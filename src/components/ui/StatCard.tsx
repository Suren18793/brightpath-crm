import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  colorTheme?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple'
  badge?: ReactNode
  onClick?: () => void
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  colorTheme = 'blue',
  badge,
  onClick,
}: StatCardProps) {
  const iconThemeClass = `stat-icon-${colorTheme}`

  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stat-content">
        <span className="stat-title">{title}</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span className="stat-value">{value}</span>
          {badge}
        </div>
        {description ? (
          <span className="stat-description">{description}</span>
        ) : null}
      </div>

      <div className={`stat-icon-wrapper ${iconThemeClass}`}>
        <Icon size={22} strokeWidth={2.2} />
      </div>
    </div>
  )
}
