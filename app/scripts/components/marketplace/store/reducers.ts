import { combineReducers } from 'redux';

import { cartReducer } from '@waldur/marketplace/cart/store/reducer';
import { comparisonReducer } from '@waldur/marketplace/compare/store/reducers';
import { offeringReducer } from '@waldur/marketplace/offerings/store/reducer';

export const reducer = combineReducers({
  comparison: comparisonReducer,
  cart: cartReducer,
  offering: offeringReducer,
});
