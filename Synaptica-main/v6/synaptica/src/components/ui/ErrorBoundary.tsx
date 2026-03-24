import { Component, type ReactNode } from 'react'

interface Props  { children: ReactNode }
interface State  { hasError: boolean; message: string }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ background: 'var(--color-bg)' }}
      >
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1
          className="font-serif text-3xl font-normal mb-3"
          style={{ color: 'var(--color-text-1)', letterSpacing: '-0.5px' }}
        >
          Something went wrong
        </h1>

        <p className="text-sm mb-2 max-w-sm" style={{ color: 'var(--color-text-2)' }}>
          This page crashed unexpectedly. Your progress is saved.
        </p>

        {this.state.message && (
          <code
            className="text-xs px-3 py-1.5 rounded-lg mb-6 block max-w-sm font-mono"
            style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-3)', border: '1px solid var(--color-border)' }}
          >
            {this.state.message}
          </code>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--color-amber)', color: '#080808' }}
          >
            Try again
          </button>
          <button
            onClick={() => { window.location.href = '/' }}
            className="px-5 py-2.5 rounded-lg text-sm font-medium border transition-all hover:bg-[var(--color-surface-2)]"
            style={{ color: 'var(--color-text-1)', borderColor: 'var(--color-border-2)' }}
          >
            Go home
          </button>
        </div>
      </div>
    )
  }
}