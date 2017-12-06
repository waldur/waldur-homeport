import * as React from 'react';
import { compose } from 'redux';
import { connect, Provider } from 'react-redux';

import store from '@waldur/store/store';
import { isVisible } from '@waldur/store/config';
import { withTranslation } from '@waldur/i18n/translate';

import * as actions from './actions';
import { getTableState } from './store';
import { registerTable } from './registry';
import { TableOptions } from './types';

export function connectTable(options: TableOptions) {
  return Component => {
    const {table} = options;
    registerTable(options);

    const mapDispatchToProps = dispatch => ({
      fetch: () => dispatch(actions.fetchListStart(table)),
      gotoPage: page => dispatch(actions.fetchListGotoPage(table, page)),
      exportAs: format => dispatch(actions.exportTableAs(table, format)),
      setQuery: query => dispatch(actions.setFilterQuery(table, query))
    });

    const filterColumns = state => columns => columns.filter(
      column => !column.feature || isVisible(state, column.feature)
    );

    const mapStateToProps = state => ({
      filterByFeature: filterColumns(state),
      ...getTableState(table)(state)
    });

    const enhance = compose(
      withTranslation,
      connect(mapStateToProps, mapDispatchToProps)
    );

    return enhance(Component);
  };
};
