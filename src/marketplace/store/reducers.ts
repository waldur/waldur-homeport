import { combineReducers } from 'redux';

import { cartReducer } from '@waldur/marketplace/cart/store/reducer';
import {
  categoryReducer,
  categoryOfferingsReducer,
  organizationGroupsReducer,
} from '@waldur/marketplace/category/store/reducers';
import { landingReducer } from '@waldur/marketplace/landing/store/reducer';
import { offeringReducer } from '@waldur/marketplace/offerings/store/reducer';
import { serviceProviderReducer } from '@waldur/marketplace/service-providers/store/reducer';

export const reducer = combineReducers({
  cart: cartReducer,
  offering: offeringReducer,
  landing: landingReducer,
  category: categoryReducer,
  categoryOfferings: categoryOfferingsReducer,
  organizationGroups: organizationGroupsReducer,
  serviceProvider: serviceProviderReducer,
});
