import { createSelector } from 'reselect';

export const getCart = state => state.marketplace.cart;

export const hasItem = (state, item) => getCart(state).items.indexOf(item) !== -1;

export const getCount = state => getCart(state).items.length;

export const getItems = state => getCart(state).items;

export const getTotal = state => getCart(state).items.reduce(
  (total, current) => total + current.price, 0);

export const getState = state => getCart(state).state;

export const getCheckoutItems = createSelector(getItems, items => items.map(item => ({
  offering_uuid: item.offering.uuid,
  offering_name: item.offering.name,
  offering_description: item.offering.description,
  offering_thumbnail: item.offering.thumbnail,
  cost: item.plan ? item.plan.cost : undefined,
})));
