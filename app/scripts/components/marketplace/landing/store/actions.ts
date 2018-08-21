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

export const setProducts = items => ({
  type: constants.SET_PRODUCTS,
  payload: {
    products: items,
  },
});

export const getProducts = () => ({
  type: constants.GET_PRODUCTS,
});

export const setCategoriesLoadingState = state => ({
  type: constants.SET_CATEGORIES_LOADING_STATE,
  payload: {
    state,
  },
});

export const setProductsLoadingState = state => ({
  type: constants.SET_PRODUCTS_LOADING_STATE,
  payload: {
    state,
  },
});
