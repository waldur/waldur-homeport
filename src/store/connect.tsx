import * as React from 'react';
import { Provider } from 'react-redux';
import { react2angular } from 'react2angular';

import store from './store';

export function withStore<P>(Component: React.ComponentType<P>) {
  const Wrapper: React.ComponentType<P> = props => (
    <Provider store={store}>
      <Component {...props}/>
    </Provider>
  );
  Wrapper.displayName = `withStore(${Component.name})`;
  return Wrapper;
}

export const connectAngularComponent = (WrappedComponent, bindings?) =>
  react2angular(withStore(WrappedComponent), bindings);
