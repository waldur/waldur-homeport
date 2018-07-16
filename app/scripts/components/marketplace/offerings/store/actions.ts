import { OfferingStep } from '../types';
import * as constants from './constants';

export const setStep = (step: OfferingStep) => ({
  type: constants.SET_STEP,
  payload: {
    step,
  },
});
