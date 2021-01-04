import { getFormSyncErrors } from 'redux-form';

import { RootState } from '@waldur/store/reducers';

import { FORM_ID } from '../store/constants';

export const hasError = (name) => (state: RootState): boolean => {
  const syncErrors: any = getFormSyncErrors(FORM_ID)(state);
  return typeof syncErrors === 'object' && syncErrors.hasOwnProperty(name);
};
