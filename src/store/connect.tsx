import * as React from 'react';
import { Provider } from 'react-redux';
import { react2angular } from 'react2angular';

import store from './store';

export function withStore(Component) {
  return props => (
    <Provider store={store}>
      <Component {...props}/>
    </Provider>
  );
}

export const connectAngularComponent = (WrappedComponent, bindings?) =>
  react2angular(withStore(WrappedComponent), bindings);
