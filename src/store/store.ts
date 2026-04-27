import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';

import { tableMiddleware } from '@/table/middleware';
import { reviewCheckMiddleware } from '@/workspace/reviewCheckMiddleware';

import { staticReducers } from './reducers';

const middlewares = [thunk, tableMiddleware, reviewCheckMiddleware];

const store: any = createStore(
  combineReducers(staticReducers),
  applyMiddleware(...middlewares),
);

export default store;
