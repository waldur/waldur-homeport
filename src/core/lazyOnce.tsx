import { ErrorBoundary } from '@sentry/react';
import { ComponentType, FC, Suspense } from 'react';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { ErrorMessage } from '@/ErrorMessage';
import { trackedLazy } from '@/navigation/pageLoading';

/**
 * The React.lazy handle is created once at module scope: after the chunk has
 * resolved, every later mount renders synchronously instead of flashing a
 * spinner. Use it for components that are mounted repeatedly (form fields,
 * chat blocks); route-level screens use lazyComponent, which also retries a
 * chunk that failed to load on the next mount.
 */
export function lazyOnce<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
): FC<P> {
  const Lazy = trackedLazy(loader);
  const LazyOnce: FC<P> = (props) => (
    <ErrorBoundary fallback={ErrorMessage}>
      <Suspense fallback={<LoadingSpinner />}>
        <Lazy {...(props as any)} />
      </Suspense>
    </ErrorBoundary>
  );
  return LazyOnce;
}
