import { combineReducers } from 'redux';

import { cartReducer } from '@waldur/marketplace/cart/store/reducer';
import { categoryReducer } from '@waldur/marketplace/category/store/reducers';
import { categoryOfferingsReducer } from '@waldur/marketplace/category/store/reducers';
import { comparisonReducer } from '@waldur/marketplace/compare/store/reducers';
import { landingReducer } from '@waldur/marketplace/landing/store/reducer';
import { offeringReducer } from '@waldur/marketplace/offerings/store/reducer';
import { ordersReducer } from '@waldur/marketplace/orders/store/reducer';
import { serviceProviderReducer } from '@waldur/marketplace/service-providers/store/reducer';

export const reducer = combineReducers({
  comparison: comparisonReducer,
  cart: cartReducer,
  offering: offeringReducer,
  landing: landingReducer,
  orders: ordersReducer,
  category: categoryReducer,
  categoryOfferings: categoryOfferingsReducer,
  serviceProvider: serviceProviderReducer,
});
