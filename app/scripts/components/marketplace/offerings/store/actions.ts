import { OfferingStep } from '../types';
import * as constants from './constants';

export const setStep = (step: OfferingStep) => ({
  type: constants.SET_STEP,
  payload: {
    step,
  },
});

export const setFilterQuery = (filterQuery: string) => ({
  type: constants.SET_FILTER_QUERY,
  payload: {
    filterQuery,
  },
});
