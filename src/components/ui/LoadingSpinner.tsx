import type { CSSProperties } from 'react'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
  label?: string
}

export function LoadingSpinner({
  size = 'md',
  color = 'currentColor',
  className = '',
  label = 'Loading...',
}: LoadingSpinnerProps) {
  const pixelSizes = {
    sm: 16,
    md: 24,
    lg: 36,
  }

  const px = pixelSizes[size]

  const style: CSSProperties = {
    width: px,
    height: px,
    animation: 'spin 0.75s linear infinite',
    display: 'inline-block',
    verticalAlign: 'middle',
  }

  return (
    <span
      role="status"
      aria-label={label}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      className={className}
    >
      <svg
        style={style}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="3"
          strokeOpacity="0.25"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
        {label}
      </span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </span>
  )
}
