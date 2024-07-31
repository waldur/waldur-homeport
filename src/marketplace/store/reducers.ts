import { combineReducers } from 'redux';

import { filterReducer } from '@waldur/marketplace/landing/filter/store/reducer';
import { serviceProviderReducer } from '@waldur/marketplace/service-providers/store/reducer';

export const reducer = combineReducers({
  serviceProvider: serviceProviderReducer,
  filters: filterReducer,
});
