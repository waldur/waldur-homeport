import { formValueSelector, getFormValues } from 'redux-form';

import { ISSUE_REGISTRATION_FORM_ID } from './constants';

const registrationFormSelector = formValueSelector(ISSUE_REGISTRATION_FORM_ID);

export const registrationFormValuesSelector = getFormValues(
  ISSUE_REGISTRATION_FORM_ID,
);

export const projectSelector = state =>
  registrationFormSelector(state, 'project');

export const customerSelector = state =>
  registrationFormSelector(state, 'customer');

export const callerSelector = state =>
  registrationFormSelector(state, 'caller');
