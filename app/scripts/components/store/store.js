import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';

import sagas from './effects';
import rootReducer from './reducers';

const sagaMiddleware = createSagaMiddleware();

let middlewares = [sagaMiddleware];

if (process.env.NODE_ENV !== 'production') {
  middlewares.push(require('redux-logger').default);
}

const store = createStore(
  rootReducer,
  applyMiddleware(...middlewares)
);

sagas.forEach((saga) => sagaMiddleware.run(saga));

export default store;
