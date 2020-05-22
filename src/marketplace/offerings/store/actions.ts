import { Offering, Category, Screenshot } from '@waldur/marketplace/types';

import { OfferingStep } from '../types';

import * as constants from './constants';

export const setStep = (step: OfferingStep) => ({
  type: constants.SET_STEP,
  payload: {
    step,
  },
});

export const updateOfferingState = (
  offering: Offering,
  stateAction: string,
  reason?: string,
) => ({
  type: constants.UPDATE_OFFERING_STATE,
  payload: {
    offering,
    stateAction,
    reason,
  },
});

export const addOfferingScreenshot = (formData: any, offering: Offering) => {
  return {
    type: constants.ADD_OFFERING_SCREENSHOT,
    payload: {
      formData,
      offering,
    },
  };
};

export const removeOfferingScreenshot = (
  offering: Offering,
  screenshot: Screenshot,
) => {
  return {
    type: constants.REMOVE_OFFERING_SCREENSHOT,
    payload: {
      offering,
      screenshot,
    },
  };
};

export const isAddingOfferingScreenshot = (isAdding: boolean) => {
  return {
    type: constants.IS_ADDING_OFFERING_SCREENSHOT,
    payload: {
      isAdding,
    },
  };
};

export const loadDataStart = () => ({
  type: constants.LOAD_DATA_START,
});

export const loadDataSuccess = data => ({
  type: constants.LOAD_DATA_SUCCESS,
  payload: {
    ...data,
  },
});

export const loadDataError = () => ({
  type: constants.LOAD_DATA_ERROR,
});

export const loadOfferingStart = offeringUuid => ({
  type: constants.LOAD_OFFERING_START,
  payload: {
    offeringUuid,
  },
});

export const removeOfferingComponent = (component: string) => ({
  type: constants.REMOVE_OFFERING_COMPONENT,
  payload: {
    component,
  },
});

export const removeOfferingQuotas = (component: string) => ({
  type: constants.REMOVE_OFFERING_QUOTAS,
  payload: {
    component,
  },
});

export const categoryChanged = (category: Category) => ({
  type: constants.CATEGORY_CHANGED,
  payload: {
    category,
  },
});
