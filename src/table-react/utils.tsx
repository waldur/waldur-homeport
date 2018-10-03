import * as React from 'react';
import { connect, ReactNode } from 'react-redux';
import { compose } from 'redux';

import { Tooltip } from '@waldur/core/Tooltip';
import { withTranslation } from '@waldur/i18n/translate';
import { isVisible } from '@waldur/store/config';
import { selectTableRows } from '@waldur/table-react/selectors';

import * as actions from './actions';
import { registerTable } from './registry';
import { getTableState } from './store';
import { TableOptions } from './types';

export function connectTable(options: TableOptions) {
  return (Component: ReactNode) => props => {
    const {table} = options;
    registerTable(options);

    const mapDispatchToProps = dispatch => ({
      fetch: () => {
        let propFilter;
        if (options.mapPropsToFilter) {
          propFilter = options.mapPropsToFilter(props);
        }
        return dispatch(actions.fetchListStart(table, propFilter));
      },
      gotoPage: page => dispatch(actions.fetchListGotoPage(table, page)),
      exportAs: format => dispatch(actions.exportTableAs(table, format)),
      setQuery: query => dispatch(actions.setFilterQuery(table, query)),
      updatePageSize: size => dispatch(actions.updatePageSize(table, size)),
      resetPagination: () => dispatch(actions.resetPagination(table)),
      sortList: (field, currentSorting) => dispatch(handleOrdering(field, currentSorting)),
    });

    const handleOrdering = (field, currentSorting) => {
      let mode = 'asc';
      if (field === currentSorting.field) {
        if (currentSorting.mode === 'asc') {
          mode = 'desc';
        } else if (currentSorting.mode === 'desc') {
          mode = 'asc';
        }
      }
      return actions.sortListStart(table, field, mode);
    };

    const filterByFeature = state => columns => columns.filter(
      column => !column.feature || isVisible(state, column.feature)
    );

    const filterColumns = state => columns => {
      return filterByFeature(state)(columns).filter(
        column => column.visible === undefined || column.visible === true
      );
    };

    const mapStateToProps = state => ({
      filterColumns: filterColumns(state),
      ...getTableState(table)(state),
      rows: selectTableRows(state, table),
    });

    const enhance = compose(
      withTranslation,
      connect(mapStateToProps, mapDispatchToProps)
    );

    const WrappedComponent = enhance(Component);
    return <WrappedComponent {...props}/>;
  };
}

export const formatLongText = value =>
  value.length > 100 ? (
    <Tooltip label={value} id="longText">
      <span className="ellipsis" style={{width: 150}}>{value}</span>
    </Tooltip>
  ) : value;

export const transformRows = (rows: any[]) => {
  const entities: object = {};
  const order: any[] = [];
  rows.map((row, index) => {
    entities[getId(row, index)] = row;
    order.push(getId(row, index));
  });
  return { entities, order };
};

const getId = (row, index) => {
  if (row.uuid) {
    return row.uuid;
  } else if (row.pk) {
    return row.pk;
  }
  return index;
};

export const renderFieldOrDash = field => field ? field : '\u2014';
