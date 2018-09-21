import { formValueSelector } from 'redux-form';

import { FORM_ID } from './constants';

const getOffering = state => state.marketplace.offering;
export const getStep = state => getOffering(state).step;
export const selectFilterQuery = state => getOffering(state).filterQuery;
export const isLoading = state => getOffering(state).loading;
export const isLoaded = state => getOffering(state).loaded;
export const isErred = state => getOffering(state).erred;
export const getCategories = state => getOffering(state).categories;
export const getComponents = (state, type) => getOffering(state).plugins[type];

const getForm = formValueSelector(FORM_ID);

export const getType = state => {
  const option = getForm(state, 'type');
  if (option) {
    return option.value;
  }
};

export const getCategory = state => getForm(state, 'category');

export const getPlanData = (state, planPath) => getForm(state, planPath);

const getComponentsPrice = components =>
  Object.keys(components)
    .filter(item => components[item].amount && components[item].price)
    .reduce((result, item) => result + components[item].amount * components[item].price, 0);

export const getPlanPrice = (state, planPath) => {
  const planData = getPlanData(state, planPath);
  if (planData && planData.components) {
    return getComponentsPrice(planData.components);
  }
  return 0;
};
