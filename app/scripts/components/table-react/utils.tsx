import * as React from 'react';
import { compose } from 'redux';
import { connect, Provider } from 'react-redux';

import store from '@waldur/store/store';
import * as actions from './actions';
import { getTableState } from './store';
import { registerTable } from './registry';
import { withTranslation } from './translate';
import { TableOptions } from './types';

export function withStore(Component) {
  return props => (
    <Provider store={store}>
      <Component {...props}/>
    </Provider>
  );
};

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

    const enhance = compose(
      withTranslation,
      connect(getTableState(table), mapDispatchToProps)
    );

    return enhance(Component);
  };
};
