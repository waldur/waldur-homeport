import { createSelector } from 'reselect';

import { combinePlanLimit } from '@waldur/marketplace/details/plan/utils';

export const getCart = state => state.marketplace.cart;

export const hasItem = (state, item) =>
  getCart(state).items.find(i => i.offering.uuid === item.offering.uuid) !== undefined;

export const getCount = state => getCart(state).items.length;

export const getItems = state => getCart(state).items;

export const getState = state => getCart(state).state;

export const getMaxUnit = (state): 'month' | 'day' => {
  const items = getItems(state);
  const units: string[] = items.filter(item => item.plan).map(item => item.plan.unit);
  return (units.indexOf('month') === -1 && units.indexOf('half_month') === -1) ? 'day' : 'month';
};

export const getCheckoutItems = createSelector(getItems, getMaxUnit, (items, maxUnit) => {
  const multipliers = {day: 30, half_month: 2, month: 1};
  return items.map(item => {
    const unit = item.plan ? item.plan.unit : undefined;
    const price = item.plan ? combinePlanLimit(item.plan, item.limits).total : 0;
    const factor = (unit && maxUnit === 'month') && multipliers[unit] || 1;
    const estimate = factor * price;
    return {
      offering_uuid: item.offering.uuid,
      offering_name: item.offering.name,
      offering_description: item.offering.description,
      offering_thumbnail: item.offering.thumbnail,
      cost: price,
      estimate,
      unit,
      attributes: item.attributes,
      limits: item.limits,
    };
  });
});

export const getTotal = createSelector(getCheckoutItems, items => {
  return items.reduce((total, item) => total + item.estimate, 0);
});
