import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { getMaxUnit } from '@waldur/marketplace/common/utils';
import { BillingPeriod } from '@waldur/marketplace/types';
import { isVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';

import { ToSForm } from './constants';

const getCart = (state: RootState) => state.marketplace.cart;

export const getItems = (state: RootState) => getCart(state).items;

export const getCount = (state: RootState) => getItems(state).length;

export const isAddingItem = (state: RootState) => getCart(state).addingItem;

export const isRemovingItem = (state: RootState) => getCart(state).removingItem;

export const isUpdatingItem = (state: RootState) => getCart(state).updatingItem;

export const isCreatingOrder = (state: RootState) =>
  getCart(state).creatingOrder;

export const getMaxUnitSelector = (state: RootState): BillingPeriod => {
  const items = getItems(state);
  return getMaxUnit(items);
};

export const getTotal = createSelector(getItems, (items) => {
  return items.reduce((total, item) => total + item.estimate, 0);
});

export const getItemSelectorFactory = (orderItemUuid) =>
  createSelector(getItems, (items) =>
    items.find((item) => item.uuid === orderItemUuid),
  );

const getFormState = (state: RootState) => state.form;
const getNamedFormState = (formName) =>
  createSelector(getFormState, (formState = {}) => formState[formName]);
const getRegisteredFields = (formName) =>
  createSelector(
    getNamedFormState(formName),
    (namedFormState) => namedFormState?.registeredFields,
  );

export const getTermsOfServiceIsVisible = (state: RootState) =>
  isVisible(state, 'marketplace.termsOfService');

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
    return (
      formValues &&
      Object.keys(registeredFields).every((key) => formValues[key] === true)
    );
  },
);

export const allOfferingsPrivate = createSelector(getItems, (items) =>
  items.every((item) => !item.offering_shared && !item.offering_billable),
);
