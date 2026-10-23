import { ErrorBoundary } from '@sentry/react';
import React, { ComponentType, LazyExoticComponent } from 'react';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { ErrorMessage } from '@/ErrorMessage';
import { trackChunk } from '@/navigation/pageLoading';

/**
 * A route's page, code-split. The React.lazy handle is created once, when the
 * route is declared, not per mount: UI-Router mounts a new instance each time
 * the state is entered, and a fresh lazy handle always suspends at least once,
 * so every visit would show the spinner (and React holds a committed fallback
 * for ~300 ms) even with the chunk long loaded. With one handle, later visits
 * render synchronously.
 *
 * A chunk that fails to load (a deploy replaced it, the network dropped) shows
 * ErrorMessage, and the handle is replaced so the next mount tries again.
 */
export function lazyComponent<T = any>(
  promise: () => Promise<{ default: ComponentType<T> }>,
) {
  const createLazy = () =>
    React.lazy(() =>
      trackChunk(promise()).catch((error) => {
        Lazy = createLazy();
        return {
          default: () => {
            /* @ts-ignore */
            return <ErrorMessage error={error} />;
          },
        };
      }),
    );
  let Lazy = createLazy();

  function LazyLoader(props: T) {
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
