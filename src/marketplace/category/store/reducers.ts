import { Offering, Section } from '@waldur/marketplace/types';

import * as constants from './constants';

interface CategoryState {
  filterQuery: string;
  sections: Section[];
  loading: boolean;
  loaded: boolean;
  erred: boolean;
}

const CATEGORY_INITIAL_STATE: CategoryState = {
  filterQuery: undefined,
  sections: [],
  loading: true,
  loaded: false,
  erred: false,
};

export const categoryReducer = (
  state = CATEGORY_INITIAL_STATE,
  action,
): CategoryState => {
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

interface CategoryOfferingState {
  items: Offering[];
  loading: boolean;
  loaded: boolean;
  erred: boolean;
}

const CATEGORY_OFFERING_INITIAL_STATE: CategoryOfferingState = {
  items: [],
  loading: false,
  loaded: false,
  erred: false,
};

export const categoryOfferingsReducer = (
  state = CATEGORY_OFFERING_INITIAL_STATE,
  action,
): CategoryOfferingState => {
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
