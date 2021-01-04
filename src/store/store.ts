import { createRouterMiddleware } from '@uirouter/redux';
import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import thunk from 'redux-thunk';

import { router } from '@waldur/router';

import sagas from './effects';
import { rootReducer } from './reducers';

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: any;
  }
}

const composeEnhancers =
  (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      trace: true,
      traceLimit: 25,
    })) ||
  compose;

const sagaMiddleware = createSagaMiddleware();

const routerMiddleware = createRouterMiddleware(router);

const middlewares = [sagaMiddleware, routerMiddleware, thunk];
let enhancedMiddlewares;

if (process.env.NODE_ENV !== 'production') {
  middlewares.push(require('redux-logger').default);
  enhancedMiddlewares = composeEnhancers(applyMiddleware(...middlewares));
} else {
  enhancedMiddlewares = applyMiddleware(...middlewares);
}

const store = createStore(rootReducer, enhancedMiddlewares);

sagas.forEach((saga) => sagaMiddleware.run(saga));

export default store;
