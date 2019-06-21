import { translate } from '@waldur/i18n';

import * as constants from './constants';

const INITIAL_STATE = {
  stateChangeStatus: {
    approving: false,
    rejecting: false,
  },
  tableFilter: {
    stateOptions: [
      {value: 'pending', label: translate('Pending')},
      {value: 'executing', label: translate('Executing')},
      {value: 'done', label: translate('Done')},
      {value: 'erred', label: translate('Erred')},
      {value: 'terminated', label: translate('Terminated')},
    ],
  },
  pendingOrders: [],
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
    case constants.PENDING_ORDERS_FETCH_SUCCESS:
      return {
        ...state,
        pendingOrders: payload.orders,
      };
    default:
      return state;
  }
};
