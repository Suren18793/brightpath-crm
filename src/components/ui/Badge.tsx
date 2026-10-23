import type { ReactNode } from 'react'

export type BadgeVariant =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'converted'
  | 'lost'
  | 'overdue'
  | 'neutral'

export interface BadgeProps {
  variant?: BadgeVariant
  icon?: ReactNode
  children: ReactNode
  className?: string
}

export function Badge({
  variant = 'neutral',
  icon,
  children,
  className = '',
}: BadgeProps) {
  const variantClass = `crm-badge-${variant.toLowerCase()}`

  return (
    <span className={`crm-badge ${variantClass} ${className}`}>
      {icon ? <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span> : null}
      {children}
    </span>
  )
}
