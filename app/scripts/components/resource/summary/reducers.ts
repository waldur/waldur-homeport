import * as constants from './constants';

const INITIAL_STATE = {
  loading: false,
  resources: {},
  errors: [],
};

export const reducer = (state = INITIAL_STATE, action) => {
  const { type, payload } = action;
  switch (type) {
    case constants.SUMMARY_RESOURCE_FETCH_START:
      return {
        ...state,
        loading: true,
      };
    case constants.SUMMARY_RESOURCE_FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        resources: {
          ...state.resources,
          [payload.resource.url]: payload.resource,
        },
      };
    case constants.SUMMARY_RESOURCE_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        errors: [...state.errors, payload.error],
      };
    default:
      return state;
  }
};
