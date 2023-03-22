import { ErrorBoundary } from '@sentry/react';
import React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

const ErrorRetryView = ({ retry }) => (
  <button className="btn btn-primary" onClick={retry}>
    {translate('Module loading error. Try again.')}
  </button>
);

// Based on https://github.com/facebook/react/issues/14254#issuecomment-538710039
export function lazyComponent<T = any>(
  promise: () => Promise<any>,
  componentName = 'default',
) {
  function LazyLoader(props: T) {
    const [loading, setLoading] = React.useState<boolean>(true);
    const retry = React.useCallback(() => setLoading(true), []);
    const Lazy = React.useMemo(
      () =>
        React.lazy(() =>
          promise()
            .then((module) => ({ default: module[componentName] }))
            .catch(() => {
              setLoading(false);
              return { default: () => <ErrorRetryView retry={retry} /> };
            }),
        ),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [promise, loading],
    );
    return (
      <ErrorBoundary>
        <React.Suspense fallback={<LoadingSpinner />}>
          <Lazy {...props} />
        </React.Suspense>
      </ErrorBoundary>
    );
  }

  (LazyLoader as any).displayName = `LazyLoader`;

  return LazyLoader as React.ComponentType<T>;
}
