import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { Tip } from '@waldur/core/Tooltip';
import { openDrawerDialog, renderDrawerDialog } from '@waldur/drawer/actions';
import { translate } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import { getTitle } from '@waldur/navigation/title';
import { router } from '@waldur/router';
import { RootState } from '@waldur/store/reducers';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { selectTableRows } from '@waldur/table/selectors';

import * as actions from './actions';
import { registerTable } from './registry';
import { getTableState } from './store';
import { TableFilterActions } from './TableFilterActions';
import {
  DisplayMode,
  ExportConfig,
  FilterItem,
  FilterPosition,
  Sorting,
  TableOptionsType,
} from './types';

const ExportDialog = lazyComponent(
  () => import('./ExportDialog'),
  'ExportDialog',
);

const TableFilterContainer = lazyComponent(
  () => import('./TableFilterContainer'),
  'TableFilterContainer',
);

export const getId = (row, index) => {
  if (row.uuid) {
    return row.uuid;
  } else if (row.pk) {
    return row.pk;
  }
  return index;
};

const getDefaultTitle = (state: RootState) => {
  const pageTitle = getTitle(state);
  const breadcrumbs = router.globals.$current.path
    .filter((part) => part.data?.breadcrumb)
    .map((part) => part.data.breadcrumb())
    .flat();

  return breadcrumbs.pop() || pageTitle;
};

export const formatLongText = (value) =>
  value && value.length > 100 ? (
    <Tip label={value} id="longText">
      <span className="ellipsis d-inline-block" style={{ width: 150 }}>
        {value}
      </span>
    </Tip>
  ) : (
    value
  );

export const transformRows = (rows: any[]) => {
  const entities: object = {};
  const order: any[] = [];
  rows.forEach((row, index) => {
    entities[getId(row, index)] = row;
    order.push(getId(row, index));
  });
  return { entities, order };
};

export const renderFieldOrDash = (field) => (field ? field : DASH_ESCAPE_CODE);

export function getNoResultMessage({ query, verboseName }) {
  const context = {
    verboseName: String(verboseName || translate('Items')).toLowerCase(),
    query: query,
  };
  if (query) {
    return translate(
      'Your search "{query}" did not match any {verboseName}.',
      context,
    );
  } else {
    return translate('There are no {verboseName} yet.', context);
  }
}

export function getNoResultTitle({ verboseName }) {
  const context = {
    verboseName: String(verboseName || translate('Items')).toLowerCase(),
  };
  return translate('No {verboseName} found', context);
}

export const getFiltersFormId = (filters: JSX.Element) => {
  if (!filters) return '';
  return filters.props?.form;
};

export const getSavedFiltersKey = (table, formId) =>
  `waldur/table/filters/${table}/${formId}`;

export const useTable = (options: TableOptionsType) => {
  const { table } = options;
  registerTable({ ...options, table });
  const dispatch = useDispatch();

  const fetch = useCallback(
    () =>
      dispatch(
        actions.fetchListStart(table, options.filter, options.pullInterval),
      ),
    [dispatch, table, options.filter, options.pullInterval],
  );
  const gotoPage = useCallback(
    (page) => dispatch(actions.fetchListGotoPage(table, page)),
    [dispatch, table],
  );
  const openExportDialog = useCallback(
    (format: ExportConfig['format'], ownProps?) =>
      dispatch(
        openModalDialog(ExportDialog, {
          resolve: {
            table,
            format,
            ownProps,
          },
        }),
      ),
    [dispatch, table],
  );
  const openFiltersDrawer = useCallback(
    (filters: React.ReactNode) => {
      dispatch(actions.applyFilters(table, false));
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
            apply: () => dispatch(actions.applyFilters(table, true)),
          },
          footer: TableFilterActions,
        }),
      );
    },
    [dispatch, table],
  );
  const renderFiltersDrawer = useCallback(
    (filters: React.ReactNode) => {
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
      dispatch(actions.applyFilters(table, true));
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

  const rows = useSelector((state: RootState) => selectTableRows(state, table));

  const alterTitle = useSelector(getDefaultTitle);

  return {
    fetch,
    gotoPage,
    openExportDialog,
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
