import { ErrorBoundary } from '@sentry/react';
import React, { ComponentType, LazyExoticComponent } from 'react';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { ErrorMessage } from '@/ErrorMessage';
import { trackChunk } from '@/navigation/pageLoading';

// Based on https://github.com/facebook/react/issues/14254#issuecomment-538710039
export function lazyComponent<T = any>(
  promise: () => Promise<{ default: ComponentType<T> }>,
) {
  function LazyLoader(props: T) {
    const [loading, setLoading] = React.useState<boolean>(true);
    const Lazy = React.useMemo(
      () =>
        React.lazy(() =>
          trackChunk(promise()).catch((error) => {
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
