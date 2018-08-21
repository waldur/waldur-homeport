import * as constants from './constants';

const INITIAL_STATE = {
  categories: {
    items: [],
    loading: false,
    loaded: false,
  },
  products: {
    items: [],
    loading: false,
    loaded: false,
  },
};

export const landingReducer = (state = INITIAL_STATE, action) => {
  const { type, payload } = action;
  switch (type) {
    case constants.SET_CATEGORIES:
      return {
        ...state,
        categories: {
          ...state.categories,
          items: payload.categories,
        },
      };
    case constants.SET_PRODUCTS:
      return {
        ...state,
        products: {
          ...state.products,
          items: payload.products,
        },
      };
    case constants.SET_CATEGORIES_LOADING_STATE:
      return {
        ...state,
        categories: {
          ...state.categories,
          ...payload.state,
        },
      };
    case constants.SET_PRODUCTS_LOADING_STATE:
      return {
        ...state,
        products: {
          ...state.products,
          ...payload.state,
        },
      };
    default:
      return state;
  }
};
