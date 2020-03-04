import { Category, Offering } from '@waldur/marketplace/types';

import * as constants from './constants';

export const categoriesFetchStart = () => ({
  type: constants.CATEGORIES_FETCH_START,
});

export const categoriesFetchSuccess = (categories: Category[]) => ({
  type: constants.CATEGORIES_FETCH_SUCCESS,
  payload: { categories },
});

export const categoriesFetchError = () => ({
  type: constants.CATEGORIES_FETCH_ERROR,
});

export const offeringsFetchStart = () => ({
  type: constants.OFFERINGS_FETCH_START,
});

export const offeringsFetchSuccess = (offerings: Offering[]) => ({
  type: constants.OFFERINGS_FETCH_SUCCESS,
  payload: { offerings },
});

export const offeringsFetchError = () => ({
  type: constants.OFFERINGS_FETCH_ERROR,
});

export const gotoOffering = (offeringId: string) => ({
  type: constants.GOTO_OFFERING,
  payload: {
    offeringId,
  },
});
