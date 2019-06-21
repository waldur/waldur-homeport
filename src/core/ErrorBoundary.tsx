import * as Sentry from '@sentry/browser';
import * as React from 'react';

import { ENV } from '@waldur/core/services';

import './ErrorBoundary.css';

export class ErrorBoundary extends React.Component {
  state = {
    error: null,
    eventId: null,
  };

  componentDidCatch(error, errorInfo) {
    this.setState({ error });
    Sentry.withScope(scope => {
      scope.setExtras(errorInfo);
      const eventId = Sentry.captureException(error);
      this.setState({ eventId });
    });
  }

  render() {
    if (this.state.error) {
      // render fallback UI
      return (
        <a
          onClick={() =>
            Sentry.showReportDialog({ eventId: this.state.eventId })
          }
        >
          Report feedback
        </a>
      );
    }

    // when there's not an error, render children untouched
    return this.props.children;
  }
}

export function withError<P>(Component: React.ComponentType<P>) {
  if (ENV && !ENV.SENTRY_DSN) {
    return Component;
  }
  const Wrapper: React.ComponentType<P> = props => (
    <ErrorBoundary>
      <Component {...props}/>
    </ErrorBoundary>
  );
  Wrapper.displayName = `withError(${Component.name})`;
  return Wrapper;
}
