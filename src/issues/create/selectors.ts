import { formValueSelector, getFormValues } from 'redux-form';

import { RootState } from '@waldur/store/reducers';

import { ISSUE_REGISTRATION_FORM_ID } from './constants';

const registrationFormSelector = formValueSelector(ISSUE_REGISTRATION_FORM_ID);

export const registrationFormValuesSelector = getFormValues(
  ISSUE_REGISTRATION_FORM_ID,
);

export const projectSelector = (state: RootState) =>
  registrationFormSelector(state, 'project');

export const customerSelector = (state: RootState) =>
  registrationFormSelector(state, 'customer');

export const callerSelector = (state: RootState) =>
  registrationFormSelector(state, 'caller');
