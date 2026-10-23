import { ReactNode } from 'react';

/**
 * What a table needs from the app around it, so the table itself needs no
 * router. The defaults use the browser alone; an app with a router of its own
 * (homeport's is UI-Router) replaces them once at startup with
 * `configureTableHost`, so URL changes go through that router.
 */
export interface TableHost {
  /** The title a table shows (and exports under) when it sets none. */
  getDefaultTitle: () => ReactNode;
  /** The current URL's query params, decoded: one value per key, an array
   * for a repeated key. */
  readQuery: () => Record<string, string | string[]>;
  /** Puts `query` (encoded, without the leading '?') in the current URL. */
  writeQuery: (query: string) => void;
}

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
};

let host: TableHost = browserHost;

/** Replaces any of the browser defaults; call once before tables render. */
export const configureTableHost = (overrides: Partial<TableHost>) => {
  host = { ...browserHost, ...overrides };
};

export const getTableHost = () => host;
