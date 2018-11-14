import { createSelector } from 'reselect';

export const getCart = state => state.marketplace.cart;

export const hasItem = (state, item) =>
  getCart(state).items.find(i => i.offering.uuid === item.offering.uuid) !== undefined;

export const getCount = state => getCart(state).items.length;

export const getItems = state => getCart(state).items;

export const getState = state => getCart(state).state;

export const getMaxUnit = (state): 'month' | 'day' => {
  const items = getItems(state);
  const units: string[] = items.filter(item => item.plan).map(item => item.plan_unit);
  return (units.indexOf('month') === -1 && units.indexOf('half_month') === -1) ? 'day' : 'month';
};

export const getTotal = createSelector(getItems, items => {
  return items.reduce((total, item) => total + item.estimate, 0);
});
