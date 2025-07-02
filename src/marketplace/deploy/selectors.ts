import {
  formValueSelector,
  getFormSubmitErrors,
  getFormSyncErrors,
  getFormValues,
  isValid,
} from 'redux-form';

import type { RootState } from '@waldur/store/reducers';

import { DeployFormData } from '../common/types';
import { ORDER_FORM_ID } from '../details/constants';

export const orderFormSelector = formValueSelector(ORDER_FORM_ID);

export const formIsValidSelector = isValid(ORDER_FORM_ID);

export const formErrorsSelector = (state: RootState) =>
  getFormSyncErrors(ORDER_FORM_ID)(state) as any;

export const formSubmitErrorsSelector = (state: RootState) =>
  getFormSubmitErrors(ORDER_FORM_ID)(state) as any;

export const orderProjectSelector = (state: RootState) =>
  orderFormSelector(state, 'project') as DeployFormData['project'];

export const orderCustomerSelector = (state: RootState) =>
  orderFormSelector(state, 'customer') as DeployFormData['customer'];

export const orderFormDataSelector = (state: RootState) =>
  (getFormValues(ORDER_FORM_ID)(state) || {}) as DeployFormData;

export const orderFormAttributesSelector = (state: RootState) => {
  const formData = orderFormDataSelector(state);
  return formData.attributes || {};
};
