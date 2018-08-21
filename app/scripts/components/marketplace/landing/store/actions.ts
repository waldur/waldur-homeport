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

export const setLoadingState = state => ({
  type: constants.SET_LOADING_STATE,
  payload: {
    state,
  },
});
