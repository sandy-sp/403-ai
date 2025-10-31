'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      // Default error UI
      return (
        <div className="card border-status-error/20 bg-status-error/5">
          <div className="flex items-start gap-4">
            <AlertTriangle size={24} className="text-status-error flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-status-error mb-2">Something went wrong</h3>
              <p className="text-text-secondary text-sm mb-4">
                An unexpected error occurred while rendering this component.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-4">
                  <summary className="text-sm font-medium cursor-pointer mb-2">
                    Error Details (Development)
                  </summary>
                  <pre className="text-xs bg-secondary p-3 rounded overflow-auto">
                    {this.state.error.message}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              <button
                onClick={this.retry}
                className="flex items-center gap-2 px-4 py-2 bg-status-error/20 text-status-error rounded-lg hover:bg-status-error/30 transition-colors"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specific error boundary for comments
export function CommentErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, retry }) => (
        <div className="card border-status-error/20 bg-status-error/5">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle size={20} className="text-status-error" />
            <h4 className="font-semibold text-status-error">Comment System Error</h4>
          </div>
          <p className="text-text-secondary text-sm mb-4">
            Unable to load comments. Please try refreshing the page.
          </p>
          <button
            onClick={retry}
            className="btn-secondary text-sm"
          >
            Retry Loading Comments
          </button>
        </div>
      )}
      onError={(error, errorInfo) => {
        console.error('Comment system error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Specific error boundary for settings
export function SettingsErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, retry }) => (
        <div className="card border-status-error/20 bg-status-error/5">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle size={20} className="text-status-error" />
            <h4 className="font-semibold text-status-error">Settings Error</h4>
          </div>
          <p className="text-text-secondary text-sm mb-4">
            Unable to load settings. Your changes may not be saved properly.
          </p>
          <button
            onClick={retry}
            className="btn-secondary text-sm"
          >
            Retry Loading Settings
          </button>
        </div>
      )}
      onError={(error, errorInfo) => {
        console.error('Settings system error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Specific error boundary for analytics
export function AnalyticsErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, retry }) => (
        <div className="card border-status-error/20 bg-status-error/5">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle size={20} className="text-status-error" />
            <h4 className="font-semibold text-status-error">Analytics Error</h4>
          </div>
          <p className="text-text-secondary text-sm mb-4">
            Unable to load analytics data. Please try again later.
          </p>
          <button
            onClick={retry}
            className="btn-secondary text-sm"
          >
            Retry Loading Analytics
          </button>
        </div>
      )}
      onError={(error, errorInfo) => {
        console.error('Analytics system error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}