import { applyMiddleware, createStore } from 'redux';

import { sentryUserMiddleware } from '@/core/sentry';

import { rootReducer } from './reducers';

const store = createStore(rootReducer, applyMiddleware(sentryUserMiddleware));

export default store;
