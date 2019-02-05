import { createSelector } from 'reselect';

import { OuterState } from '../types';

const getCart = (state: OuterState) => state.marketplace.cart;

export const getItems = (state: OuterState) => getCart(state).items;

export const getCount = (state: OuterState) => getItems(state).length;

export const isAddingItem = (state: OuterState) => getCart(state).addingItem;

export const isRemovingItem = (state: OuterState) => getCart(state).removingItem;

export const isUpdatingItem = (state: OuterState) => getCart(state).updatingItem;

export const isCreatingOrder = (state: OuterState) => getCart(state).creatingOrder;

export const getMaxUnit = (state: OuterState): 'month' | 'day' => {
  const items = getItems(state);
  const units: string[] = items.filter(item => item.plan).map(item => item.plan_unit);
  return (units.indexOf('month') === -1 && units.indexOf('half_month') === -1) ? 'day' : 'month';
};

export const getTotal = createSelector(getItems, items => {
  return items.reduce((total, item) => total + item.estimate, 0);
});

export const getItemSelectorFactory = orderItemUuid =>
  createSelector(getItems, items =>
    items.find(item => item.uuid === orderItemUuid)
  );
