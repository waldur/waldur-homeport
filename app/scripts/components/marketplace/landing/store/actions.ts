import * as constants from './constants';

export const setCategories = items => ({
  type: constants.SET_CATEGORIES,
  payload: {
    categories: items,
  },
});

export const getCategories = () => ({
  type: constants.GET_CATEGORIES,
});

export const setOfferings = items => ({
  type: constants.SET_OFFERINGS,
  payload: {
    offerings: items,
  },
});

export const getOfferings = () => ({
  type: constants.GET_OFFERINGS,
});

export const setCategoriesLoadingState = state => ({
  type: constants.SET_CATEGORIES_LOADING_STATE,
  payload: {
    state,
  },
});

export const setOfferingsLoadingState = state => ({
  type: constants.SET_OFFERINGS_LOADING_STATE,
  payload: {
    state,
  },
});
