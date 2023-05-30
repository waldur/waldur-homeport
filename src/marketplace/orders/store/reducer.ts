import { OrderItemDetailsType, StatusChange } from '../types';

import * as constants from './constants';

const INITIAL_STATE = {
  stateChangeStatus: {
    approving: false,
    rejecting: false,
  },
  pendingOrders: [],
};

interface OrderState {
  stateChangeStatus: StatusChange;
  pendingOrders: OrderItemDetailsType[];
}

export const ordersReducer = (state = INITIAL_STATE, action): OrderState => {
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
