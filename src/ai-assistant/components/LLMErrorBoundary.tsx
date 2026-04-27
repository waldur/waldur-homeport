import { XIcon, WarningCircleIcon } from '@phosphor-icons/react';
import React, { Component, ReactNode } from 'react';

import { translate } from '@/i18n';

interface Props {
  children: ReactNode;
  onClose?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
}

export class LLMErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Store error info for display in the chat interface
    this.setState((state) => ({
      ...state,
      error,
      errorInfo: errorInfo.componentStack,
    }));
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="aui-root aui-thread-root">
          <div className="aui-thread-header">
            <button
              className="aui-button aui-close-button"
              onClick={this.props.onClose}
              aria-label={translate('Close')}
            >
              <XIcon weight="bold" />
            </button>
          </div>

          <div className="aui-thread-viewport aui-error-container">
            <div className="aui-error-icon">
              <WarningCircleIcon size={48} weight="light" />
            </div>

            <h3 className="aui-error-title">
              {translate('Chat Temporarily Unavailable')}
            </h3>

            <div className="aui-error-details">
              <strong>{translate('Error')}:</strong>{' '}
              {this.state.error?.message || 'Unknown error occurred'}
              {process.env.NODE_ENV === 'development' &&
                this.state.errorInfo && (
                  <details>
                    <summary className="aui-error-summary">
                      {translate('Technical Details (Development)')}
                    </summary>
                    <pre className="aui-error-stack">
                      {this.state.errorInfo}
                    </pre>
                  </details>
                )}
            </div>

            <p className="aui-error-message">
              {translate(
                'We are experiencing technical difficulties with the AI assistant. Please try again or contact support if the problem persists.',
              )}
            </p>

            <div className="aui-error-actions">
              <button
                onClick={() =>
                  this.setState({
                    hasError: false,
                    error: undefined,
                    errorInfo: undefined,
                  })
                }
                className="aui-error-btn aui-error-btn--primary"
              >
                {translate('Try Again')}
              </button>

              {this.props.onClose && (
                <button
                  onClick={this.props.onClose}
                  className="aui-error-btn aui-error-btn--secondary"
                >
                  {translate('Close')}
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
