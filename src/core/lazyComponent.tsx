import { ErrorBoundary } from '@sentry/react';
import React, { ComponentType, LazyExoticComponent } from 'react';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { ErrorMessage } from '@/ErrorMessage';
import { trackChunk } from '@/navigation/pageLoading';

type LazyRoute<T> = LazyExoticComponent<ComponentType<T>> & {
  /** Load the chunk ahead of the first mount, so that mount needs no spinner. */
  preload(): Promise<unknown>;
};

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
  // The component once its chunk has loaded, through the handle or through
  // preload(). A mount after that renders it directly, so a preloaded page
  // needs no spinner even on its first visit.
  let Loaded: ComponentType<T> | undefined;
  const load = () =>
    promise().then((module) => {
      Loaded = module.default;
      return module;
    });
  const createLazy = () =>
    React.lazy(() =>
      trackChunk(load()).catch((error) => {
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
    // Which of the two it renders is decided once, as it mounts. Switching
    // to `Loaded` when the chunk arrived changed the tree's shape under the
    // loader, and React remounted everything below it -- for the layout's
    // loader, the whole page, which lost what had been done on it meanwhile
    // and fetched everything again. A lazy component that has resolved
    // renders at once, so staying on it costs nothing.
    const [loadedAtMount] = React.useState(() => Loaded);
    if (loadedAtMount) {
      const LoadedAtMount = loadedAtMount;
      return (
        <ErrorBoundary fallback={ErrorMessage}>
          {/* @ts-ignore */}
          <LoadedAtMount {...props} />
        </ErrorBoundary>
      );
    }
    return (
      <ErrorBoundary fallback={ErrorMessage}>
        <React.Suspense fallback={<LoadingSpinner />}>
          {/* @ts-ignore */}
          <Lazy {...props} />
        </React.Suspense>
      </ErrorBoundary>
    );
  }
  LazyLoader.preload = () => load().catch(() => undefined);
  return LazyLoader as unknown as LazyRoute<T>;
}
