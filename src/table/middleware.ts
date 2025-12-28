import { Middleware } from 'redux';

import { queryClient } from '@waldur/core/queryClient';

import { FETCH_LIST_START } from './actions';

/**
 * Store for extraFilter per table.
 * When external components dispatch fetchListStart with extraFilter,
 * we store it here so useTableQuery can access it.
 */
export const tableExtraFilters: Record<string, Record<string, any>> = {};

/**
 * Middleware that bridges fetchListStart Redux actions to React Query.
 * This maintains backward compatibility for external components that
 * dispatch fetchListStart actions to trigger table refreshes.
 */
export const tableMiddleware: Middleware = () => (next) => (action: any) => {
  if (action.type === FETCH_LIST_START) {
    const { table, extraFilter, force } = action.payload;

    // Store extraFilter for useTableQuery to access
    if (extraFilter) {
      tableExtraFilters[table] = extraFilter;
    }

    // Invalidate React Query cache to trigger refetch
    // Using setTimeout to ensure this happens after the action is processed
    setTimeout(() => {
      queryClient.invalidateQueries({
        queryKey: ['table', table],
        refetchType: force ? 'all' : 'active',
      });
    }, 0);
  }

  return next(action);
};
