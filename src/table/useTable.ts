import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { openDrawerDialog, renderDrawerDialog } from '@waldur/drawer/actions';
import { translate } from '@waldur/i18n';
import { getTitle } from '@waldur/navigation/title';
import { router } from '@waldur/router';
import { type RootState } from '@waldur/store/reducers';
import { selectTableRows, getTableState } from '@waldur/table/selectors';

import * as actions from './actions';
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

const getDefaultTitle = (state: RootState) => {
  const pageTitle = getTitle(state);
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

  const fetch = useCallback(
    (force = false) => {
      dispatch(
        actions.fetchListStart(
          table,
          options.filter,
          options.pullInterval,
          force,
        ),
      );
    },
    [dispatch, table, options.filter, options.pullInterval],
  );
  const gotoPage = useCallback(
    (page) => dispatch(actions.fetchListGotoPage(table, page)),
    [dispatch, table],
  );
  const openFiltersDrawer = useCallback(
    (filters: JSX.Element) => {
      applyFiltersFn(false);
      return dispatch(
        openDrawerDialog(TableFilterContainer, {
          title: translate('Filters'),
          subtitle: translate('Apply filters to table data'),
          width: '500px',
          props: {
            table,
            filters,
            setFilter: (item: FilterItem) =>
              dispatch(actions.setFilter(table, item)),
            apply: () => applyFiltersFn(true),
          },
          footer: TableFilterActions,
        }),
      );
    },
    [dispatch, table],
  );
  const renderFiltersDrawer = useCallback(
    (filters: JSX.Element) => {
      dispatch(
        renderDrawerDialog(TableFilterContainer, {
          props: {
            table,
            filters,
            setFilter: (item: FilterItem) =>
              dispatch(actions.setFilter(table, item)),
          },
        }),
      );
      applyFiltersFn(true);
      dispatch(actions.selectSavedFilter(table, null));
    },
    [dispatch, table],
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
  const applyFiltersFn = useCallback(
    (apply: boolean) => dispatch(actions.applyFilters(table, apply)),
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

  const tableState = useSelector(getTableState(table));

  const rows = useSelector(
    (state: RootState) => selectTableRows(state, table) as RowType[],
  );

  const alterTitle = useSelector(getDefaultTitle);

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
    ...tableState,
    table,
    rows,
    alterTitle,
  };
};
