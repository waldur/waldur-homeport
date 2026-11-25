import { applyMiddleware, createStore } from 'redux';

import { sentryUserMiddleware } from '@/core/sentry';
import { userFeaturesMiddleware } from '@/features/userFeatures';

import { rootReducer } from './reducers';

const store = createStore(
  rootReducer,
  applyMiddleware(sentryUserMiddleware, userFeaturesMiddleware),
);

export default store;
