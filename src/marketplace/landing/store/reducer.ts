import * as constants from './constants';

const INITIAL_STATE = {
  categories: {
    items: [],
    loading: false,
    loaded: false,
  },
  offerings: {
    items: [],
    loading: false,
    loaded: false,
  },
};

export const landingReducer = (state = INITIAL_STATE, action) => {
  const { type, payload } = action;
  switch (type) {
    case constants.CATEGORIES_FETCH_START:
      return {
        ...state,
        categories: {
          ...state.categories,
          loading: true,
          loaded: false,
        },
      };
    case constants.CATEGORIES_FETCH_SUCCESS:
      return {
        ...state,
        categories: {
          ...state.categories,
          items: payload.categories,
          loading: false,
          loaded: true,
        },
      };
    case constants.CATEGORIES_FETCH_ERROR:
      return {
        ...state,
        categories: {
          ...state.categories,
          loading: false,
          loaded: false,
        },
      };
    case constants.OFFERINGS_FETCH_START:
      return {
        ...state,
        offerings: {
          ...state.offerings,
          loading: true,
          loaded: false,
        },
      };
    case constants.OFFERINGS_FETCH_SUCCESS:
      return {
        ...state,
        offerings: {
          ...state.offerings,
          items: payload.offerings,
          loading: false,
          loaded: true,
        },
      };
    case constants.OFFERINGS_FETCH_ERROR:
      return {
        ...state,
        offerings: {
          ...state.offerings,
          loading: false,
          loaded: false,
        },
      };
    default:
      return state;
  }
};
