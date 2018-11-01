import * as constants from './constants';

const INITIAL_STATE = {
  secretCode: {
    code: '',
    generating: false,
  },
};

export const serviceProviderReducer = (state = INITIAL_STATE, action) => {
  const { type, payload } = action;
  switch (type) {
    case constants.SERVICE_PROVIDER_CODE_REGENERATE_START:
      return {
        ...state,
        secretCode: {
          ...state.secretCode,
          generating: true,
        },
      };

    case constants.SERVICE_PROVIDER_CODE_REGENERATE_SUCCESS:
      return {
        ...state,
        secretCode: {
          ...state.secretCode,
          generating: false,
          code: payload.code,
        },
      };

    case constants.SERVICE_PROVIDER_CODE_REGENERATE_ERROR:
      return {
        ...state,
        secretCode: {
          ...state.secretCode,
          generating: false,
        },
      };

    case constants.SERVICE_PROVIDER_CODE_FETCH_SUCCESS:
      return {
        ...state,
        secretCode: {
          ...state.secretCode,
          code: payload.code,
        },
      };

    default:
      return state;
  }
};
