import { UIRouterContextComponent } from '@uirouter/react-hybrid';
import * as React from 'react';
import { Provider } from 'react-redux';

import { withError } from '@waldur/core/ErrorBoundary';
import { react2angular } from '@waldur/shims/react2angular';

import store from './store';

export function withStore<P>(Component: React.ComponentType<P>) {
  const Wrapper: React.ComponentType<P> = props => (
    <Provider store={store}>
      <UIRouterContextComponent>
        <Component {...props} />
      </UIRouterContextComponent>
    </Provider>
  );
  Wrapper.displayName = `withStore(${Component.name})`;
  return Wrapper;
}

export const connectAngularComponent = (WrappedComponent, bindings?) =>
  react2angular(withStore(withError(WrappedComponent)), bindings);
