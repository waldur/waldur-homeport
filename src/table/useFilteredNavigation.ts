import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { router } from '@/router';

import * as tableActions from './actions';

/**
 * Opens a list page with its filters set, so it shows exactly the rows a
 * count elsewhere stood for.
 *
 * The values go straight into the destination table's filter state rather
 * than into the URL: a table seeds its filters from the URL only for names it
 * holds no filter for yet, so once the list has been filtered in this session
 * a URL-only link would open it on the earlier filter instead. An empty value
 * clears that filter, which is how a count of "everything" opens the list
 * unfiltered. The page is reset to the first.
 */
export const useFilteredNavigation = () => {
  const dispatch = useDispatch();

  return useCallback(
    (
      state: string,
      table: string,
      filters: Record<string, any>,
      params?: Record<string, any>,
    ) => {
      Object.entries(filters).forEach(([name, value]) =>
        dispatch(
          tableActions.setFilter(table, {
            name,
            value,
            label: null,
            component: null,
          }),
        ),
      );
      dispatch(tableActions.resetPagination(table));
      router.stateService.go(state, params);
    },
    [dispatch],
  );
};
