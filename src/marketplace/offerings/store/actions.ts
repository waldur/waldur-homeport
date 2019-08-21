import { Offering, Category } from '@waldur/marketplace/types';

import { OfferingStep } from '../types';
import * as constants from './constants';

export const setStep = (step: OfferingStep) => ({
  type: constants.SET_STEP,
  payload: {
    step,
  },
});

export const updateOfferingState = (offering: Offering, stateAction: string, reason?: string) => ({
  type: constants.UPDATE_OFFERING_STATE,
  payload: {
    offering,
    stateAction,
    reason,
  },
});

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

export const offeringBookingFetch = payload => ({
  type: constants.BOOKINGS_FETCH,
  payload: {
    offering_type: 'Marketplace.Booking',
    offering_uuid: payload.offering_uuid,
  },
});

export const setBookingItems = (offeringId, items) => ({
  type: constants.BOOKINGS_SET,
  payload: {
    offeringId,
    items,
  },
});
