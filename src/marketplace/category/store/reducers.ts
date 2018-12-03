import * as constants from './constants';

const INITIAL_STATE = {
  filterQuery: undefined,
  sections: [],
  loading: true,
  loaded: false,
  erred: false,
};

export const categoryReducer = (state = INITIAL_STATE, action) => {
  const { type, payload } = action;
  switch (type) {

    case constants.SET_FILTER_QUERY:
      return {
        ...state,
        filterQuery: payload.filterQuery,
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
        sections: payload.sections,
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

export const categoryOfferingsReducer = (state = {items: []}, action) => {
  const { type, payload } = action;
  switch (type) {

    case constants.LOAD_OFFERINGS_START:
      return {
        ...state,
        loading: true,
        loaded: false,
        erred: false,
      };

    case constants.LOAD_OFFERINGS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        erred: false,
        items: payload.items,
      };

    case constants.LOAD_OFFERINGS_ERROR:
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
