import { ErrorBoundary } from '@sentry/react';
import React, { ComponentType, LazyExoticComponent } from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { ErrorMessage } from '@waldur/ErrorMessage';

// Based on https://github.com/facebook/react/issues/14254#issuecomment-538710039
export function lazyComponent<T = any>(
  promise: () => Promise<{ default: ComponentType<T> }>,
) {
  function LazyLoader(props: T) {
    const [loading, setLoading] = React.useState<boolean>(true);
    const Lazy = React.useMemo(
      () =>
        React.lazy(() =>
          promise().catch((error) => {
            setLoading(false);
            return {
              default: () => {
                /* @ts-ignore */
                return <ErrorMessage error={error} />;
              },
            };
          }),
        ),
      [promise, loading],
    );
    return (
      <ErrorBoundary fallback={ErrorMessage}>
        <React.Suspense fallback={<LoadingSpinner />}>
          {/* @ts-ignore */}
          <Lazy {...props} />
        </React.Suspense>
      </ErrorBoundary>
    );
  }
  return LazyLoader as LazyExoticComponent<ComponentType<T>>;
}
