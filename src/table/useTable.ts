import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getInitialValues, syncFiltersToURL } from '@/core/filters';
import { useDrawer } from '@/drawer/actions';
import { translate } from '@/i18n';
import { getTitle } from '@/navigation/title';
import { router } from '@/router';
import { type RootState } from '@/store/reducers';
import { makeSelectTableRows, getTableState } from '@/table/selectors';

import * as actions from './actions';
import { INITIAL_STATE } from './constants';
import { registerTable, unregisterTable } from './registry';
import { TableFilterActions } from './TableFilterActions';
import { TableFilterContainer } from './TableFilterContainer';
import {
  DisplayMode,
  FilterItem,
  FilterPosition,
  Sorting,
  TableOptionsType,
} from './types';
import { useTableQuery } from './useTableQuery';

const getDefaultTitle = () => {
  const pageTitle = getTitle();
  const breadcrumbs = router.globals.$current.path
    .filter((part) => part.data?.breadcrumb)
    .map((part) => part.data.breadcrumb())
    .flat();

  let breadcrumbTitle = breadcrumbs.pop();
  if (!breadcrumbTitle) {
    breadcrumbTitle = router.globals.$current.parent?.data?.breadcrumb?.();
  }

  return breadcrumbTitle || pageTitle;
};

export const useTable = <RowType = any>(options: TableOptionsType<RowType>) => {
  const { table } = options;
  const isRegisteredRef = useRef(false);
  const queryClient = useQueryClient();

  // Register table on first render, unregister on unmount
  if (!isRegisteredRef.current) {
    registerTable({ ...options, table });
    isRegisteredRef.current = true;
  }

  useEffect(() => {
    return () => {
      unregisterTable(table);
    };
  }, [table]);

  const dispatch = useDispatch();
  const { openDrawer, renderDrawer } = useDrawer();

  // Get Redux state for request building
  const tableState = useSelector(getTableState(table));
  const {
    pagination = INITIAL_STATE.pagination,
    query = '',
    sorting = INITIAL_STATE.sorting,
    activeColumns = {},
    filtersStorage = [],
    applyFilters = false,
  } = tableState || {};

  // Seed filtersStorage from initialFilters on first mount
  useEffect(() => {
    const initialFilters = options.syncFiltersToURL
      ? getInitialValues(options.initialFilters)
      : options.initialFilters;

    if (initialFilters) {
      Object.entries(initialFilters).forEach(([name, value]) => {
        if (value != null) {
          dispatch(
            actions.setFilter(table, {
              name,
              value,
              label: null,
              component: null,
            }),
          );
        }
      });
    }
  }, [table, dispatch]);

  const filterKeysRef = useRef<Set<string>>(
    new Set(options.initialFilters ? Object.keys(options.initialFilters) : []),
  );

  useEffect(() => {
    if (filtersStorage) {
      filtersStorage.forEach((f) => filterKeysRef.current.add(f.name));
    }
  }, [filtersStorage]);

  // Automatic URL sync (opt-in)
  useEffect(() => {
    if (options.syncFiltersToURL && filtersStorage) {
      const values = {} as Record<string, any>;
      filterKeysRef.current.forEach((key) => {
        values[key] = null;
      });
      filtersStorage.forEach((f) => {
        values[f.name] = f.value;
      });
      syncFiltersToURL(values);
    }
  }, [filtersStorage, options.syncFiltersToURL]);

  const filter = options.filter;

  // Track firstFetch for onApplyFilter callback
  const firstFetchRef = useRef(true);

  // Use a ref for onApplyFilter to avoid triggering the effect
  // when the callback reference changes (e.g., unmemoized inline functions)
  const onApplyFilterRef = useRef(options.onApplyFilter);
  onApplyFilterRef.current = options.onApplyFilter;

  // Use React Query for fetching
  const { data, isLoading, isFetching, error, refetch } =
    useTableQuery<RowType>({
      table,
      fetchData: options.fetchData,
      filter,
      staleTime: options.staleTime,
      queryField: options.queryField,
      mandatoryFields: options.mandatoryFields,
      onFetch: options.onFetch,
      currentPage: pagination.currentPage,
      pageSize: pagination.pageSize,
      query,
      sorting,
      activeColumns,
    });

  // Sync fetched data to Redux for compatibility
  useEffect(() => {
    if (data) {
      // Handle "Invalid page" by resetting pagination to page 1
      if (data.invalidPage) {
        dispatch(actions.resetPagination(table));
        return;
      }
      dispatch(
        actions.fetchListDone(
          table,
          data.entities,
          data.order,
          data.resultCount,
        ),
      );
      // Reset sorting loading state if it was active
      if (sorting.loading) {
        dispatch(actions.sortListDone(table));
      }
      firstFetchRef.current = false;
    }
  }, [data, dispatch, table, sorting.loading]);

  // Sync error to Redux
  useEffect(() => {
    if (error) {
      dispatch(actions.fetchListError(table, error));
    }
  }, [error, dispatch, table]);

  // Handle onApplyFilter callback
  useEffect(() => {
    if (applyFilters && onApplyFilterRef.current) {
      onApplyFilterRef.current(filtersStorage, firstFetchRef.current);
    }
  }, [applyFilters, filtersStorage]);

  // fetch() triggers React Query refetch
  const fetch = useCallback(
    (force = false) => {
      // invalidateQueries already refetches the active table query (and busts
      // the inner createFetcher cache). Calling refetch() as well fired a second
      // concurrent refetch that cancelled the first in-flight request; the
      // nested createFetcher query captured that aborted signal in its retry
      // closure, so every retry failed on it — stalling the refresh mask for
      // ~8s (3 retries at 1s/2s/4s backoff). Do one or the other, never both.
      if (force) {
        queryClient.invalidateQueries({ queryKey: ['table', table] });
      } else {
        refetch();
      }
    },
    [refetch, table, queryClient],
  );

  const gotoPage = useCallback(
    (page) => dispatch(actions.fetchListGotoPage(table, page)),
    [dispatch, table],
  );

  const applyFiltersFn = useCallback(
    (apply: boolean) => dispatch(actions.applyFilters(table, apply)),
    [dispatch, table],
  );

  const openFiltersDrawer = useCallback(
    (filters: JSX.Element, formId?: string) => {
      applyFiltersFn(false);
      openDrawer(TableFilterContainer, {
        title: translate('Filters'),
        subtitle: translate('Apply filters to table data'),
        width: '500px',
        table,
        filters,
        formId,
        filterPosition: 'sidebar' as const,
        setFilter: (item: FilterItem) =>
          dispatch(actions.setFilter(table, item)),
        apply: () => applyFiltersFn(true),
        footer: TableFilterActions,
      });
    },
    [openDrawer, applyFiltersFn, table, dispatch],
  );
  const renderFiltersDrawer = useCallback(
    (filters: JSX.Element, formId?: string) => {
      renderDrawer(TableFilterContainer, {
        table,
        filters,
        formId,
        filterPosition: 'sidebar' as const,
        setFilter: (item: FilterItem) =>
          dispatch(actions.setFilter(table, item)),
      });
      applyFiltersFn(true);
      dispatch(actions.selectSavedFilter(table, null));
    },
    [renderDrawer, applyFiltersFn, table, dispatch],
  );

  const setDisplayMode = useCallback(
    (mode: DisplayMode) => dispatch(actions.setMode(table, mode)),
    [dispatch, table],
  );
  const setQuery = useCallback(
    (query) => dispatch(actions.setFilterQuery(table, query)),
    [dispatch, table],
  );
  const setFilterPosition = useCallback(
    (filterPosition: FilterPosition) =>
      dispatch(actions.setFilterPosition(table, filterPosition)),
    [dispatch, table],
  );
  const setFilter = useCallback(
    (item: FilterItem) => dispatch(actions.setFilter(table, item)),
    [dispatch, table],
  );
  const updatePageSize = useCallback(
    (size) => dispatch(actions.updatePageSize(table, size)),
    [dispatch, table],
  );
  const resetPagination = useCallback(
    () => dispatch(actions.resetPagination(table)),
    [dispatch, table],
  );
  const sortList = useCallback(
    (sorting: Sorting) => dispatch(actions.sortListStart(table, sorting)),
    [dispatch, table],
  );
  const toggleRow = useCallback(
    (row: any) => dispatch(actions.toggleRow(table, row)),
    [dispatch, table],
  );
  const selectRow = useCallback(
    (row: any) => dispatch(actions.selectRow(table, row)),
    [dispatch, table],
  );
  const selectAllRows = useCallback(
    (rows: any[]) => dispatch(actions.selectAllRows(table, rows)),
    [dispatch, table],
  );
  const resetSelection = useCallback(
    () => dispatch(actions.resetSelection(table)),
    [dispatch, table],
  );
  const toggleColumn = useCallback(
    (id: string, column: any, value?: boolean) =>
      dispatch(actions.toggleColumn(table, id, column, value)),
    [dispatch, table],
  );
  const initColumnPositions = useCallback(
    (ids: string[]) => dispatch(actions.initColumnPositions(table, ids)),
    [dispatch, table],
  );
  const swapColumns = useCallback(
    (column1: string, column2: string) =>
      dispatch(actions.swapColumns(table, column1, column2)),
    [dispatch, table],
  );
  const resetColumns = useCallback(
    () => dispatch(actions.resetColumns(table)),
    [dispatch, table],
  );

  const alterTitle = getDefaultTitle();

  // Get rows from Redux (synced from React Query via useEffect above)
  // This maintains backward compatibility with tests that populate Redux directly
  // Each useTable instance gets its own selector to avoid cache thrashing
  // when multiple tables are active (e.g. page table + drawer table).
  const selectRows = useMemo(() => makeSelectTableRows(), []);
  const reduxRows = useSelector(
    (state: RootState) => selectRows(state, table) as RowType[],
  );
  const rows = data?.rows ?? reduxRows;

  // Memoize pagination to prevent infinite re-renders in Table's useEffect
  // that depends on props.pagination
  const resultCount = data?.resultCount ?? pagination.resultCount;
  const memoizedPagination = useMemo(
    () => ({
      ...pagination,
      resultCount,
    }),
    [pagination, resultCount],
  );

  return {
    fetch,
    gotoPage,
    openFiltersDrawer,
    renderFiltersDrawer,
    setDisplayMode,
    setQuery,
    setFilterPosition,
    setFilter,
    applyFiltersFn,
    updatePageSize,
    resetPagination,
    sortList,
    toggleRow,
    selectRow,
    selectAllRows,
    resetSelection,
    toggleColumn,
    initColumnPositions,
    swapColumns,
    resetColumns,
    // Spread tableState for UI state (mode, toggled, selectedRows, etc.)
    ...tableState,
    // Override with React Query state
    loading: isLoading || isFetching,
    error,
    pagination: memoizedPagination,
    table,
    rows,
    alterTitle,
    // Pass current filter for export functionality
    filter,
  };
};
