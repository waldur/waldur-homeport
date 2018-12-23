import { Offering } from '@waldur/offering/types';

import { OfferingStep } from '../types';
import * as constants from './constants';

export const setStep = (step: OfferingStep) => ({
  type: constants.SET_STEP,
  payload: {
    step,
  },
});

export const updateOfferingState = (offering: Offering, stateAction: string) => ({
  type: constants.UPDATE_OFFERING_STATE,
  payload: {
    offering,
    stateAction,
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
