import { Offering } from '@waldur/marketplace/types';
import { RootState } from '@waldur/store/reducers';

export const getItems = (state: RootState) =>
  state.marketplace.comparison.items;
export const hasItem = (state: RootState, item: Offering) =>
  state.marketplace.comparison.items.find((i) => i.uuid === item.uuid) !==
  undefined;
export const getCount = (state: RootState) =>
  state.marketplace.comparison.items.length;
