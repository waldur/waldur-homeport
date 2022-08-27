import * as constants from '../constants';

export const addPaymentProfile = (payload) => ({
  type: constants.ADD_PAYMENT_PROFILE,
  payload,
});

export const editPaymentProfile = (payload) => ({
  type: constants.EDIT_PAYMENT_PROFILE,
  payload,
});

export const removePaymentProfile = (payload) => ({
  type: constants.REMOVE_PAYMENT_PROFILE,
  payload,
});

export const enablePaymentProfile = (payload) => ({
  type: constants.ENABLE_PAYMENT_PROFILE,
  payload,
});
