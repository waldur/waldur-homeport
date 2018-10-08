import * as constants from './constants';

const INITIAL_STATE = {
  stateChangeStatus: {
    processing: false,
    processed: false,
  },
};

export const ordersReducer = (state = INITIAL_STATE, action) => {
  const { type, payload } = action;
  switch (type) {
    case constants.SET_ORDER_STATE_CHANGE_STATUS:
      return {
        ...state,
        stateChangeStatus: {
          ...state.stateChangeStatus,
          ...payload.status,
        },
      };
    default:
      return state;
  }
};
