import { MarketplaceFilterItem } from '../types';

export const SET_MARKETPLACE_FILTER =
  'waldur/marketplace/SET_MARKETPLACE_FILTER';

export const setMarketplaceFilter = (item: MarketplaceFilterItem) => ({
  type: SET_MARKETPLACE_FILTER,
  payload: { item },
});
