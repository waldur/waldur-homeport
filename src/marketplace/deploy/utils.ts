import { getFormValues, isValid } from 'redux-form';

import { isVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';

import { FORM_ID } from '../details/constants';

export const scrollToView = (viewId: string) => {
  const el = document.getElementById(viewId);
  window.scroll({
    behavior: 'smooth',
    left: 0,
    top: el.offsetTop - 130,
  });
};

export const concealPricesSelector = (state: RootState) =>
  isVisible(state, 'marketplace.conceal_prices');

export const formDataSelector = (state: RootState) =>
  (getFormValues(FORM_ID)(state) || {}) as any;

export const formProjectSelector = (state: RootState) => {
  const formData = formDataSelector(state);
  return formData.project;
};

export const formIsValidSelector = (state: RootState) =>
  isValid(FORM_ID)(state);
