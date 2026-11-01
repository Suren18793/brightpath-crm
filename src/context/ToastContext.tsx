import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { ToastContainer } from '../components/feedback/ToastContainer'

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
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
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
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
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
