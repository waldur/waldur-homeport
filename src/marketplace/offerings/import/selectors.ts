import { getFormValues } from 'redux-form';

import { type RootState } from '@/store/reducers';

import { OFFERING_IMPORT_FORM_ID } from './constants';
import { OfferingImportFormData } from './types';

export const importOfferingSelector = (state: RootState) =>
  getFormValues(OFFERING_IMPORT_FORM_ID)(state) as OfferingImportFormData;
