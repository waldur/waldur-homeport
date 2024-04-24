import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { Tip } from '@waldur/core/Tooltip';
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
import { TableOptionsType, Sorting, ExportConfig } from './types';

const ExportDialog = lazyComponent(
  () => import('./ExportDialog'),
  'ExportDialog',
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

export function getMessage({ query, verboseName }) {
  const context = { verboseName: verboseName || translate('items') };
  if (query) {
    return translate(
      'There are no {verboseName} found matching the filter.',
      context,
    );
  } else {
    return translate('There are no {verboseName} yet.', context);
  }
}

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
  const setQuery = useCallback(
    (query) => dispatch(actions.setFilterQuery(table, query)),
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
  const toggleFilter = useCallback(
    () => dispatch(actions.toggleFilter(table)),
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

  const tableState = useSelector(getTableState(table));

  const rows = useSelector((state: RootState) => selectTableRows(state, table));

  const alterTitle = useSelector(getDefaultTitle);

  return {
    fetch,
    gotoPage,
    openExportDialog,
    setQuery,
    updatePageSize,
    resetPagination,
    sortList,
    toggleRow,
    toggleFilter,
    selectRow,
    selectAllRows,
    resetSelection,
    ...tableState,
    rows,
    alterTitle,
  };
};
