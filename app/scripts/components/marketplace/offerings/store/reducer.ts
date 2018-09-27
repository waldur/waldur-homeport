import * as constants from './constants';

const INITIAL_STATE = {
  step: 'Describe',
  loading: true,
  loaded: false,
  erred: false,
  categories: [],
  plugins: {},
};

export const offeringReducer = (state = INITIAL_STATE, action) => {
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

    case constants.LOAD_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        erred: false,
        categories: payload.categories,
        plugins: payload.plugins,
      };

    case constants.LOAD_DATA_ERROR:
      return {
        ...state,
        loading: false,
        loaded: false,
        erred: true,
      };

    default:
      return state;
  }
};
