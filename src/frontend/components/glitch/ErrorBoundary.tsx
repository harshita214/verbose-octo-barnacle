import { Component, ReactNode } from 'react'
import '../../styles/ErrorBoundary.css'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: any) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: any | null
  errorCount: number
}

/**
 * ErrorBoundary Component
 * Catches React component errors and displays fallback UI
 * Follows spooky naming: possess_error, glitch_boundary
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error
    console.error('🔴 ErrorBoundary caught an error:', error, errorInfo)

    // Update state
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }))

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handle_retry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handle_reload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-content">
            <div className="error-icon">👻</div>
            <h1 className="error-title">The Curse is Too Strong!</h1>
            <p className="error-message">
              Something went wrong. The spirits have corrupted this part of the interface.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="error-details">
                <details className="error-stack">
                  <summary className="error-summary">Error Details (Development Only)</summary>
                  <pre className="error-code">
                    <code>
                      {this.state.error.toString()}
                      {'\n\n'}
                      {this.state.errorInfo?.componentStack}
                    </code>
                  </pre>
                </details>
              </div>
            )}

            <div className="error-actions">
              <button className="retry-button" onClick={this.handle_retry}>
                🔄 Try Again
              </button>
              <button className="reload-button" onClick={this.handle_reload}>
                🏠 Return Home
              </button>
            </div>

            {this.state.errorCount > 2 && (
              <div className="error-warning">
                <p>
                  ⚠️ Multiple errors detected. If this persists, please refresh the page or clear
                  your browser cache.
                </p>
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
