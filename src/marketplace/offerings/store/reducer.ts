import * as constants from './constants';

const INITIAL_STATE = {
  step: 'Overview',
  loading: true,
  loaded: false,
  erred: false,
  categories: [],
  plugins: {},
  offering: {},
  isAddingScreenshot: false,
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
