import { applyMiddleware, combineReducers, createStore } from 'redux';

import { sentryUserMiddleware } from '@/core/sentry';

import { staticReducers } from './reducers';

const store = createStore(
  combineReducers(staticReducers),
  applyMiddleware(sentryUserMiddleware),
);

export default store;
