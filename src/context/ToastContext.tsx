import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
}

export interface ToastContextValue {
  showToast: (message: string, type?: ToastType, durationMs?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'success', durationMs = 3500) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newItem: ToastItem = { id, message, type }

      setToasts((prev) => [...prev, newItem])

      setTimeout(() => {
        removeToast(id)
      }, durationMs)
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="crm-toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`crm-toast-item toast-${toast.type}`} role="status">
            <div className="toast-icon">
              {toast.type === 'success' && <CheckCircle2 size={16} className="text-emerald-500" />}
              {toast.type === 'error' && <AlertCircle size={16} className="text-rose-500" />}
              {toast.type === 'info' && <Info size={16} className="text-blue-500" />}
            </div>
            <div className="toast-message">{toast.message}</div>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
