import * as React from 'react';
import { connect, ReactNode } from 'react-redux';
import { compose } from 'redux';

import { Tooltip } from '@waldur/core/Tooltip';
import { withTranslation } from '@waldur/i18n/translate';
import { isVisible } from '@waldur/store/config';

import * as actions from './actions';
import { registerTable } from './registry';
import { getTableState } from './store';
import { TableOptions } from './types';

export function connectTable(options: TableOptions) {
  return (Component: ReactNode) => props => {
    const {table} = options;
    registerTable(options);

    const handleFetch = () => {
      let propFilter;
      if (options.mapPropsToFilter) {
        propFilter = options.mapPropsToFilter(props);
      }
      return actions.fetchListStart(table, propFilter);
    };

    const mapDispatchToProps = dispatch => ({
      fetch: () => dispatch(handleFetch()),
      gotoPage: page => dispatch(actions.fetchListGotoPage(table, page)),
      exportAs: format => dispatch(actions.exportTableAs(table, format)),
      setQuery: query => dispatch(actions.setFilterQuery(table, query)),
    });

    const filterColumns = state => columns => columns.filter(
      column => !column.feature || isVisible(state, column.feature)
    );

    const mapStateToProps = state => ({
      filterByFeature: filterColumns(state),
      ...getTableState(table)(state),
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
      <span className="elipsis" style={{width: 150}}>{value}</span>
    </Tooltip>
  ) : value;
