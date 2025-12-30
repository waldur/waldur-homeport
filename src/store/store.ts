import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';

import { tableMiddleware } from '@waldur/table/middleware';
import { reviewCheckMiddleware } from '@waldur/workspace/reviewCheckMiddleware';

import { staticReducers } from './reducers';

const middlewares = [thunk, tableMiddleware, reviewCheckMiddleware];

const store: any = createStore(
  combineReducers(staticReducers),
  applyMiddleware(...middlewares),
);

export default store;
