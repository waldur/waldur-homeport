import { change } from 'redux-form';

import { OrderItemResponse } from '@waldur/marketplace/orders/types';
import { openModalDialog } from '@waldur/modal/actions';

import * as constants from './constants';

export const approveOrder = (orderUuid: string) => ({
  type: constants.APPROVE_ORDER,
  payload: {
    orderUuid,
  },
});

export const fetchPendingOrders = params => ({
  type: constants.PENDING_ORDERS_FETCH,
  payload: {
    params,
  },
});

export const fetchPendingOrdersSuccess = (orders: OrderItemResponse) => ({
  type: constants.PENDING_ORDERS_FETCH_SUCCESS,
  payload: {
    orders,
  },
});

export const rejectOrder = (orderUuid: string) => ({
  type: constants.REJECT_ORDER,
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

export const setOrderStateFilter = (formName, filterOption) =>
  change(formName, 'state', filterOption);

export const showTermsOfServiceDialog = (content: string) =>
  openModalDialog('marketplaceTermsOfServiceDialog', {
    resolve: { content },
    size: 'md',
  });
