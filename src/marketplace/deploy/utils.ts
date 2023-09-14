import { isValid, getFormSyncErrors } from 'redux-form';

import { isVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';

import { FORM_ID } from '../details/constants';
import { formDataSelector } from '../utils';

import { OfferingConfigurationFormStep } from './types';

export const scrollToView = (viewId: string) => {
  const el = document.getElementById(viewId);
  window.scroll({
    behavior: 'smooth',
    left: 0,
    top: el.offsetTop - 130,
  });
};

export const hasStepWithField = (
  steps: OfferingConfigurationFormStep[],
  field: string,
) =>
  steps &&
  steps.some((step) => step.fields && step.fields.some((key) => key === field));

export const concealPricesSelector = (state: RootState) =>
  isVisible(state, 'marketplace.conceal_prices');

export const formProjectSelector = (state: RootState) => {
  const formData = formDataSelector(state);
  return formData.project;
};

export const formIsValidSelector = (state: RootState) =>
  isValid(FORM_ID)(state);

export const formErrorsSelector = (state: RootState) =>
  getFormSyncErrors(FORM_ID)(state) as any;
