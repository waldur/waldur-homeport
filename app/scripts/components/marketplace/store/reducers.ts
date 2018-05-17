import { combineReducers } from 'redux';

import { cartReducer } from '@waldur/marketplace/cart/store/reducer';
import { comparisonReducer } from '@waldur/marketplace/compare/store/reducers';

export const reducer = combineReducers({
  comparison: comparisonReducer,
  cart: cartReducer,
});
