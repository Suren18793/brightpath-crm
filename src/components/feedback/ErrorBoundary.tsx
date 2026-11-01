import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react'

export interface ErrorBoundaryProps {
  children: ReactNode
}

export interface ErrorBoundaryState {
  hasError: boolean
  errorMessage: string
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      errorMessage: '',
    }
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const message =
      error instanceof Error
        ? error.message
        : 'An unexpected application runtime error occurred.'
    return {
      hasError: true,
      errorMessage: message,
    }
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Uncaught application error:', error, errorInfo)
  }

  handleReload = (): void => {
    window.location.reload()
  }

  handleResetDemoCacheAndReload = (): void => {
    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('brightpath_')) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k))
    } catch {
      // Ignore storage access errors
    }
    window.location.reload()
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className="error-boundary-screen"
          role="alert"
          aria-live="assertive"
        >
          <div className="error-boundary-card">
            <div className="error-boundary-icon-box" aria-hidden="true">
              <AlertTriangle size={28} />
            </div>

            <h1 className="error-boundary-title">
              Something went wrong in BrightPath CRM
            </h1>
            <p className="error-boundary-subtitle">
              The application encountered an unexpected runtime error. Your Supabase database records are safe. You can reload the page or reset the local workshop cache below.
            </p>

            {this.state.errorMessage && (
              <pre className="error-boundary-details">
                {this.state.errorMessage}
              </pre>
            )}

            <div className="error-boundary-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.handleReload}
              >
                <RefreshCw size={16} />
                Reload Application
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={this.handleResetDemoCacheAndReload}
              >
                <RotateCcw size={16} />
                Reset Demo Cache &amp; Reload
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
