import * as constants from './constants';

export const setOrderState = (orderUuid, state) => ({
  type: constants.SET_ORDER_STATE,
  payload: {
    orderUuid,
    state,
  },
});

export const setOrderStateChangeStatus = status => ({
  type: constants.SET_ORDER_STATE_CHANGE_STATUS,
  payload: {
    status,
  },
});
