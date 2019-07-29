import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { BillingPeriod } from '@waldur/marketplace/types';
import { isVisible } from '@waldur/store/config';

import { OuterState } from '../types';
import { ToSForm } from './constants';

const getCart = (state: OuterState) => state.marketplace.cart;

export const getItems = (state: OuterState) => getCart(state).items;

export const getCount = (state: OuterState) => getItems(state).length;

export const isAddingItem = (state: OuterState) => getCart(state).addingItem;

export const isRemovingItem = (state: OuterState) => getCart(state).removingItem;

export const isUpdatingItem = (state: OuterState) => getCart(state).updatingItem;

export const isCreatingOrder = (state: OuterState) => getCart(state).creatingOrder;

export const getMaxUnit = (state: OuterState): BillingPeriod => {
  const items = getItems(state);
  const units: string[] = items.filter(item => item.plan).map(item => item.plan_unit);
  if (units.indexOf('month') !== -1) {
    return 'month';
  }
  if (units.indexOf('half_month') !== -1) {
    return 'month';
  }
  if (units.indexOf('day') !== -1) {
    return 'day';
  }
  return 'hour';
};

export const getTotal = createSelector(getItems, items => {
  return items.reduce((total, item) => total + item.estimate, 0);
});

export const getItemSelectorFactory = orderItemUuid =>
  createSelector(getItems, items =>
    items.find(item => item.uuid === orderItemUuid)
  );

const getFormState = state => state.form;
const getNamedFormState = formName => createSelector(getFormState, (formState = {}) => formState[formName]);
const getRegisteredFields = formName => createSelector(getNamedFormState(formName), (namedFormState = {}) => namedFormState.registeredFields);

export const getTermsOfServiceIsVisible = state => isVisible(state, 'marketplace.termsOfService');

export const allTermsOfServiceAgreed = createSelector(
  getFormValues(ToSForm),
  getRegisteredFields(ToSForm),
  getTermsOfServiceIsVisible,
  (formValues, registeredFields, termsOfServiceIsVisible) => {
    if (!termsOfServiceIsVisible) {
      return true;
    }
    if (!registeredFields) {
      return true;
    }
    return formValues && Object.keys(registeredFields).every(key => formValues[key] === true);
  }
);

export const allOfferingsPrivate = createSelector(
  getItems,
  items => items.every(item => !item.offering_shared && !item.offering_billable)
);
