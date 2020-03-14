import { formValueSelector, getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { getOfferingComponentsFilter } from '@waldur/marketplace/common/registry';
import { OfferingComponent } from '@waldur/marketplace/types';
import {
  isOwnerOrStaff,
  getCustomer,
  getUser,
} from '@waldur/workspace/selectors';

import { FORM_ID, DRAFT } from './constants';
import { PlanFormData } from './types';
import { formatComponents } from './utils';

export const getOffering = state => state.marketplace.offering;
export const getStep = state => getOffering(state).step;
export const isLoading = state => getOffering(state).loading;
export const isLoaded = state => getOffering(state).loaded;
export const isErred = state => getOffering(state).erred;
export const getCategories = state => getOffering(state).categories;
export const getOfferingComponents = (state, type) =>
  getOffering(state).plugins[type].components;
export const getOfferingLimits = (state, type) =>
  getOffering(state).plugins[type].available_limits;

export const getForm = formValueSelector(FORM_ID);

export const getComponents = (state, type): OfferingComponent[] => {
  const builtinComponents = getOfferingComponents(state, type);
  const builtinTypes: string[] = builtinComponents.map(c => c.type);
  const formComponents: OfferingComponent[] = formatComponents(
    getForm(state, 'components') || [],
  );
  let components = [
    ...builtinComponents,
    ...formComponents.filter(c => !builtinTypes.includes(c.type)),
  ];
  const offeringComponentsFilter = getOfferingComponentsFilter(type);
  if (offeringComponentsFilter) {
    const formData = getFormValues(FORM_ID)(state);
    components = offeringComponentsFilter(formData, components);
  }
  return components;
};

export const getTypeLabel = (state: any): string => {
  const option = getForm(state, 'type');
  if (option) {
    return option.label;
  }
};

export const getType = (state: any): string => {
  const option = getForm(state, 'type');
  if (option) {
    return option.value;
  }
};

export const getCategory = state => getForm(state, 'category');

export const getAttributes = state => getForm(state, 'attributes');

export const getPlans = (state): PlanFormData[] => getForm(state, 'plans');

export const getPlanData = (state, planPath: string): PlanFormData =>
  getForm(state, planPath);

export const getPlanPrice = (state, planPath) => {
  const planData = getPlanData(state, planPath);
  if (planData && planData.quotas && planData.prices) {
    const type = getType(state);
    const components = (type ? getComponents(state, type) : [])
      .filter(component => component.billing_type === 'fixed')
      .map(component => component.type);
    const keys = Object.keys(planData.quotas).filter(
      key => components.indexOf(key) !== -1,
    );
    return keys.reduce(
      (total, item) =>
        total + (planData.quotas[item] || 0) * (planData.prices[item] || 0),
      0,
    );
  }
  return 0;
};

export const isOfferingManagementDisabled = createSelector(
  isOwnerOrStaff,
  getOffering,
  getCustomer,
  getUser,
  (ownerOrStaff, offeringState, customer, user) => {
    if (!customer) {
      return false;
    }
    if (!customer.is_service_provider) {
      return true;
    }
    if (!ownerOrStaff) {
      return true;
    }
    const offering = offeringState.offering;
    if (
      offering &&
      offering.state &&
      offering.state !== DRAFT &&
      !user.is_staff
    ) {
      return true;
    }
  },
);
