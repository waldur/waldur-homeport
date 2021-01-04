import { Category, Offering } from '@waldur/marketplace/types';

import { OfferingStep } from '../types';

import * as constants from './constants';

interface OfferingState {
  step: OfferingStep;
  loading: boolean;
  loaded: boolean;
  erred: boolean;
  categories: Category[];
  offering: Offering;
  plugins: any;
  isAddingScreenshot: boolean;
}

const INITIAL_STATE: OfferingState = {
  step: 'Overview',
  loading: true,
  loaded: false,
  erred: false,
  categories: [],
  plugins: {},
  offering: {} as Offering,
  isAddingScreenshot: false,
};

export const offeringReducer = (
  state = INITIAL_STATE,
  action,
): OfferingState => {
  const { type, payload } = action;
  switch (type) {
    case constants.SET_STEP:
      return {
        ...state,
        step: payload.step,
      };

    case constants.LOAD_DATA_START:
      return {
        ...state,
        loading: true,
        loaded: false,
        erred: false,
      };

    case constants.IS_ADDING_OFFERING_SCREENSHOT:
      return {
        ...state,
        isAddingScreenshot: payload.isAdding,
      };

    case constants.LOAD_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        erred: false,
        ...payload,
      };

    case constants.LOAD_DATA_ERROR:
      return {
        ...state,
        loading: false,
        loaded: false,
        erred: true,
      };

    case constants.LOAD_OFFERING_START:
      return {
        ...state,
        loading: true,
        loaded: false,
        erred: false,
      };
    default:
      return state;
  }
};
