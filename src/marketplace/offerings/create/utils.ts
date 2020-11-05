import { getFormSyncErrors } from 'redux-form';

import { OFFERING_FORM_ID } from '../store/constants';

export const hasError = (name) => (state) => {
  const syncErrors: any = getFormSyncErrors(OFFERING_FORM_ID)(state);
  return typeof syncErrors === 'object' && syncErrors.hasOwnProperty(name);
};
