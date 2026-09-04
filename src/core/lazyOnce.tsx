import { ErrorBoundary } from '@sentry/react';
import { ComponentType, FC, lazy, Suspense } from 'react';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { ErrorMessage } from '@/ErrorMessage';

/**
 * Like lazyComponent, but the React.lazy handle is created once at module
 * scope: after the chunk has resolved, every later mount renders synchronously
 * instead of flashing a spinner. Use it for components that are mounted
 * repeatedly (form fields, chat blocks); lazyComponent stays the choice for
 * route-level screens, where its per-instance retry is worth more.
 */
export function lazyOnce<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
): FC<P> {
  const Lazy = lazy(loader);
  const LazyOnce: FC<P> = (props) => (
    <ErrorBoundary fallback={ErrorMessage}>
      <Suspense fallback={<LoadingSpinner />}>
        <Lazy {...(props as any)} />
      </Suspense>
    </ErrorBoundary>
  );
  return LazyOnce;
}
