import * as constants from './constants';

export const approveOrder = (orderUuid: string) => ({
  type: constants.APPROVE_ORDER,
  payload: {
    orderUuid,
  },
});

export const setOrderStateChangeStatus = status => ({
  type: constants.SET_ORDER_STATE_CHANGE_STATUS,
  payload: {
    status,
  },
});
