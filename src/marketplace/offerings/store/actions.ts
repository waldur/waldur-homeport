import { Offering, Category, Image } from '@waldur/marketplace/types';

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

export const addOfferingImage = (formData: any, offering: Offering) => {
  return {
    type: constants.ADD_OFFERING_IMAGE,
    payload: {
      formData,
      offering,
    },
  };
};

export const removeOfferingImage = (offering: Offering, image: Image) => {
  return {
    type: constants.REMOVE_OFFERING_IMAGE,
    payload: {
      offering,
      image,
    },
  };
};

export const addOfferingLocation = (offering: Offering) => ({
  type: constants.ADD_OFFERING_LOCATION,
  payload: {
    offering,
  },
});

export const isAddingOfferingImage = (isAdding: boolean) => {
  return {
    type: constants.IS_ADDING_OFFERING_IMAGE,
    payload: {
      isAdding,
    },
  };
};

export const loadDataStart = () => ({
  type: constants.LOAD_DATA_START,
});

export const loadDataSuccess = (data) => ({
  type: constants.LOAD_DATA_SUCCESS,
  payload: {
    ...data,
  },
});

export const loadDataError = () => ({
  type: constants.LOAD_DATA_ERROR,
});

export const loadOfferingStart = (offeringUuid) => ({
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

export const googleCalendarSync = (uuid: string) => ({
  type: constants.GOOGLE_CALENDAR_SYNC,
  payload: {
    uuid,
  },
});

export const googleCalendarPublish = (uuid: string) => ({
  type: constants.GOOGLE_CALENDAR_PUBLISH,
  payload: {
    uuid,
  },
});

export const googleCalendarUnpublish = (uuid: string) => ({
  type: constants.GOOGLE_CALENDAR_UNPUBLISH,
  payload: {
    uuid,
  },
});
