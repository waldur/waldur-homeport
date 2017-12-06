import * as React from 'react';
import { connect, Provider } from 'react-redux';
import { react2angular } from 'react2angular';

import store from '@waldur/store/store';
import { isVisible } from '@waldur/store/config';

export function withStore(Component) {
  return props => (
    <Provider store={store}>
      <Component {...props}/>
    </Provider>
  );
}

export function withVisible(Component) {
  const mapStateToProps = (state) => ({
    isVisible: (feature): boolean => isVisible(state, feature),
  });

  return connect(mapStateToProps)(Component);
}

export interface IfVisibleProps {
  isVisible: (feature: string) => boolean;
}

export const connectAngularComponent = (WrappedComponent, bindings?) =>
  react2angular(withStore(WrappedComponent), bindings);
