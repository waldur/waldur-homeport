import * as constants from './constants';

const INITIAL_STATE = {
  categories: {
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
    case constants.SET_LOADING_STATE:
      return {
        ...state,
        categories: {
          ...state.categories,
          ...payload.state,
        },
      };
    default:
      return state;
  }
};
