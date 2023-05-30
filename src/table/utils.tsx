import React, { useCallback } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n/translate';
import { getTitle } from '@waldur/navigation/title';
import { router } from '@waldur/router';
import { isVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { selectTableRows } from '@waldur/table/selectors';

import * as actions from './actions';
import { registerTable } from './registry';
import { getTableState } from './store';
import { TableOptionsType, Sorting } from './types';

export const getId = (row, index) => {
  if (row.uuid) {
    return row.uuid;
  } else if (row.pk) {
    return row.pk;
  }
  return index;
};

const filterByFeature = (state: RootState) => (columns) =>
  columns.filter(
    (column) => !column.feature || isVisible(state, column.feature),
  );

const filterColumns = (state: RootState) => (columns) => {
  return filterByFeature(state)(columns).filter(
    (column) => column.visible === undefined || column.visible === true,
  );
};

const getDefaultTitle = (state: RootState) => {
  const pageTitle = getTitle(state);
  const breadcrumbs = router.globals.$current.path
    .filter((part) => part.data?.breadcrumb)
    .map((part) => part.data.breadcrumb())
    .flat();

  return breadcrumbs.pop() || pageTitle;
};

export function connectTable(options: TableOptionsType) {
  return function wrapper<P = {}>(Component: React.ComponentType<P>) {
    const Wrapper: React.ComponentType<P> = (props) => {
      const { table: rawTableId } = options;
      const extraId = options.mapPropsToTableId
        ? options.mapPropsToTableId(props).filter((x) => x !== undefined)
        : [];
      const table = `${rawTableId}${
        extraId.length ? '-' + extraId.join('-') : ''
      }`;
      registerTable({ ...options, table });

      const mapDispatchToProps = (dispatch) => ({
        fetch: () => {
          let propFilter;
          if (options.mapPropsToFilter) {
            propFilter = options.mapPropsToFilter(props);
          }
          return dispatch(
            actions.fetchListStart(table, propFilter, options.pullInterval),
          );
        },
        gotoPage: (page) => dispatch(actions.fetchListGotoPage(table, page)),
        exportAs: (format) =>
          dispatch(actions.exportTableAs(table, format, props)),
        setQuery: (query) => dispatch(actions.setFilterQuery(table, query)),
        updatePageSize: (size) => dispatch(actions.updatePageSize(table, size)),
        resetPagination: () => dispatch(actions.resetPagination(table)),
        sortList: (sorting: Sorting) =>
          dispatch(actions.sortListStart(table, sorting)),
        toggleRow: (row: any) => dispatch(actions.toggleRow(table, row)),
        toggleFilter: () => dispatch(actions.toggleFilter(table)),
        selectRow: (row: any) => dispatch(actions.selectRow(table, row)),
        selectAllRows: (rows: any[]) =>
          dispatch(actions.selectAllRows(table, rows)),
        resetSelection: () => dispatch(actions.resetSelection(table)),
      });

      const mapStateToProps = (state: RootState) => ({
        alterTitle: getDefaultTitle(state),
        filterColumns: filterColumns(state),
        ...getTableState(table)(state),
        rows: selectTableRows(state, table),
      });

      const enhance = connect(mapStateToProps, mapDispatchToProps);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      /* @ts-ignore */
      const ConnectedComponent = enhance(Component);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      /* @ts-ignore */
      return <ConnectedComponent {...props} />;
    };
    Wrapper.displayName = `connectTable(${Component.name})`;
    return Wrapper;
  };
}

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
  const exportAs = useCallback(
    (format) => dispatch(actions.exportTableAs(table, format)),
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
    exportAs,
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
