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
  isPublic?: boolean,
  refreshOffering?: () => void,
) => ({
  type: constants.UPDATE_OFFERING_STATE,
  payload: {
    offering,
    stateAction,
    reason,
    isPublic,
    refreshOffering,
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

export const isUpdatingOffering = (isUpdating: boolean) => {
  return {
    type: constants.IS_UPDATING_OFFERING,
    payload: {
      isUpdating,
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

export const pullRemoteOfferingDetails = (uuid: string) => ({
  type: constants.PULL_REMOTE_OFFERING_DETAILS,
  payload: { uuid },
});

export const pullRemoteOfferingUsers = (uuid: string) => ({
  type: constants.PULL_REMOTE_OFFERING_USERS,
  payload: { uuid },
});

export const pullRemoteOfferingUsage = (uuid: string) => ({
  type: constants.PULL_REMOTE_OFFERING_USAGE,
  payload: { uuid },
});

export const pullRemoteOfferingResources = (uuid: string) => ({
  type: constants.PULL_REMOTE_OFFERING_RESOURCES,
  payload: { uuid },
});

export const pullRemoteOfferingOrderItems = (uuid: string) => ({
  type: constants.PULL_REMOTE_OFFERING_ORDER_ITEMS,
  payload: { uuid },
});

export const pullRemoteOfferingInvoices = (uuid: string) => ({
  type: constants.PULL_REMOTE_OFFERING_INVOICES,
  payload: { uuid },
});

export const pullRemoteOfferingRobotAccounts = (uuid: string) => ({
  type: constants.PULL_REMOTE_OFFERING_ROBOT_ACCOUNTS,
  payload: { uuid },
});
