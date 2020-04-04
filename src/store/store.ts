/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';

import sagas from './effects';
import rootReducer from './reducers';

const composeEnhancers =
  // @ts-ignore
  (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
    // @ts-ignore
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      trace: true,
      traceLimit: 25,
    })) ||
  compose;
const sagaMiddleware = createSagaMiddleware();

const middlewares = [sagaMiddleware];
let enhancedMiddlewares;

if (process.env.NODE_ENV !== 'production') {
  middlewares.push(require('redux-logger').default);
  enhancedMiddlewares = composeEnhancers(applyMiddleware(...middlewares));
} else {
  enhancedMiddlewares = applyMiddleware(...middlewares);
}

const store = createStore(rootReducer, enhancedMiddlewares);

sagas.forEach(saga => sagaMiddleware.run(saga));

export default store;
