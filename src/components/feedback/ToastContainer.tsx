import { useEffect } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import type { ToastItem } from '../../context/ToastContext'

export interface ToastContainerProps {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  useEffect(() => {
    if (toasts.length === 0) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && toasts.length > 0) {
        onDismiss(toasts[toasts.length - 1].id)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toasts, onDismiss])

  if (toasts.length === 0) return null

  return (
    <div
      className="crm-toast-container"
      role="region"
      aria-label="System Notifications"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`crm-toast-item toast-${toast.type}`}
          role={toast.type === 'error' ? 'alert' : 'status'}
        >
          <div className="toast-icon" aria-hidden="true">
            {toast.type === 'success' && (
              <CheckCircle2 size={16} className="text-emerald-500" />
            )}
            {toast.type === 'error' && (
              <AlertCircle size={16} className="text-rose-500" />
            )}
            {toast.type === 'info' && (
              <Info size={16} className="text-blue-500" />
            )}
          </div>
          <div className="toast-message">{toast.message}</div>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
            title="Dismiss notification (Esc)"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
