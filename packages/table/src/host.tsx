import type { FallbackRender } from '@sentry/react';
import { ComponentType, lazy, ReactNode, Suspense } from 'react';

type LazyComponent = (
  load: () => Promise<{ default: ComponentType<any> }>,
) => ComponentType<any>;

/**
 * What a table needs from the app around it, so the table itself needs no
 * router and nothing else of the app's. The defaults use the browser alone;
 * an app with a router of its own (homeport's is UI-Router) replaces them
 * once at startup with `configureTableHost`.
 */
export interface TableHost {
  /** The title a table shows (and exports under) when it sets none. */
  getDefaultTitle: () => ReactNode;
  /** The current URL's query params, decoded: one value per key, an array
   * for a repeated key. */
  readQuery: () => Record<string, string | string[]>;
  /** Puts `query` (encoded, without the leading '?') in the current URL. */
  writeQuery: (query: string) => void;
  /** Shown in place of the rows when rendering them threw. Without one the
   * table catches nothing, and the error reaches the app's own boundary. */
  ErrorFallback?: FallbackRender;
  /** Code-splits a dialog the table opens. Called on the dialog's first
   * render, so after `configureTableHost`. */
  lazyComponent: LazyComponent;
}

// This module imports nothing but React: the app's startup and every unit
// test's setup load it, before a test can mock what it would bring in.
const defaultLazyComponent: LazyComponent = (load) => {
  const Lazy = lazy(load);
  return function LazyLoader(props) {
    return (
      <Suspense fallback={null}>
        <Lazy {...props} />
      </Suspense>
    );
  };
};

const browserHost: TableHost = {
  getDefaultTitle: () => document.title,
  readQuery: () => {
    const params = new URLSearchParams(window.location.search);
    const query: Record<string, string | string[]> = {};
    for (const key of new Set(params.keys())) {
      const values = params.getAll(key);
      query[key] = values.length > 1 ? values : values[0];
    }
    return query;
  },
  writeQuery: (query) => {
    const { pathname, hash } = window.location;
    window.history.replaceState(
      window.history.state,
      '',
      pathname + (query ? '?' + query : '') + hash,
    );
  },
  lazyComponent: defaultLazyComponent,
};

let host: TableHost = browserHost;

/** Replaces any of the browser defaults; call once before tables render. */
export const configureTableHost = (overrides: Partial<TableHost>) => {
  host = { ...browserHost, ...overrides };
};

export const getTableHost = () => host;

/**
 * A dialog of the table's own, code-split the host's way. The host is asked
 * on the first render, not as the module loads: by then the app has
 * configured it.
 */
export const lazyTableDialog = <T,>(
  load: () => Promise<{ default: ComponentType<T> }>,
): ComponentType<T> => {
  let Loader: ComponentType<any> | undefined;
  return function TableDialogLoader(props) {
    Loader ??= host.lazyComponent(load);
    return <Loader {...props} />;
  };
};
