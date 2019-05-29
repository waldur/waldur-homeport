import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { Tooltip } from '@waldur/core/Tooltip';
import { translate, withTranslation } from '@waldur/i18n/translate';
import { isVisible } from '@waldur/store/config';
import { selectTableRows } from '@waldur/table-react/selectors';

import * as actions from './actions';
import { registerTable } from './registry';
import { getTableState } from './store';
import { TableOptions, Sorting } from './types';

export function connectTable(options: TableOptions) {
  return function wrapper<P = {}>(Component: React.ComponentType<P>) {
    const Wrapper: React.ComponentType<P> = props => {
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
        exportAs: format => dispatch(actions.exportTableAs(table, format, props)),
        setQuery: query => dispatch(actions.setFilterQuery(table, query)),
        updatePageSize: size => dispatch(actions.updatePageSize(table, size)),
        resetPagination: () => dispatch(actions.resetPagination(table)),
        sortList: (sorting: Sorting) => dispatch(actions.sortListStart(table, sorting)),
        toggleRow: (row: any) => dispatch(actions.toggleRow(table, row)),
      });

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
        connect(mapStateToProps, mapDispatchToProps),
        withTranslation,
      );

      const ConnectedComponent = enhance(Component);
      return <ConnectedComponent {...props}/>;
    };
    Wrapper.displayName = `connectTable(${Component.name})`;
    return Wrapper;
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

export function getMessage({ query, verboseName }) {
  const context = {verboseName: verboseName || translate('items')};
  if (query && query !== '') {
    return translate('There are no {verboseName} found matching the filter.', context);
  } else {
    return translate('There are no {verboseName} yet.', context);
  }
}
