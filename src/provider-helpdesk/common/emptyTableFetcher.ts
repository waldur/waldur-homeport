/**
 * No-op table fetcher: renders the table shell with an empty body without
 * hitting the API. Used when there is nothing to scope a fetch to yet (e.g. no
 * helpdesk configured), so the custom placeholder shows inside the table
 * container instead of a bare message.
 */
export const emptyTableFetcher = () =>
  Promise.resolve({ rows: [], resultCount: 0 });
