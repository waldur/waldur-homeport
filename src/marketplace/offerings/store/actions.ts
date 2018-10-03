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

export const loadDataSuccess = (categories, plugins) => ({
  type: constants.LOAD_DATA_SUCCESS,
  payload: {
    categories,
    plugins,
  },
});

export const loadDataError = () => ({
  type: constants.LOAD_DATA_ERROR,
});
