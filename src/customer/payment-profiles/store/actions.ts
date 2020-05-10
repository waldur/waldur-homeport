import { PaymentProfile } from '@waldur/workspace/types';

import * as constants from '../constants';

export const addPaymentProfile = (formData: PaymentProfile) => ({
  type: constants.ADD_PAYMENT_PROFILE,
  payload: formData,
});

export const editPaymentProfile = (uuid: string, formData: PaymentProfile) => ({
  type: constants.EDIT_PAYMENT_PROFILE,
  payload: {
    uuid: uuid,
    formData: formData,
  },
});

export const removePaymentProfile = (uuid: string) => ({
  type: constants.REMOVE_PAYMENT_PROFILE,
  payload: uuid,
});

export const enablePaymentProfile = (uuid: string) => ({
  type: constants.ENABLE_PAYMENT_PROFILE,
  payload: uuid,
});
