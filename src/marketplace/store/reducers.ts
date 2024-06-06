import { combineReducers } from 'redux';

import { cartReducer } from '@waldur/marketplace/cart/store/reducer';
import { filterReducer } from '@waldur/marketplace/landing/filter/store/reducer';
import { serviceProviderReducer } from '@waldur/marketplace/service-providers/store/reducer';

export const reducer = combineReducers({
  cart: cartReducer,
  serviceProvider: serviceProviderReducer,
  filters: filterReducer,
});
