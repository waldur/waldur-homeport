import { createFormAction } from 'redux-form-saga';

export const APPROVE_ORDER = 'waldur/marketplace/orders/APPROVE_ORDER';
export const SET_ORDER_STATE_CHANGE_STATUS = 'waldur/marketplace/orders/SET_ORDER_STATE_CHANGE_STATUS';
export const submitUsage = createFormAction('waldur/marketplace/orders/SUBMIT_USAGE');
