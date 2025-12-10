import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { SINGLE_OFFERING_IMPORT_FORM_ID } from './constants';
import { SingleOfferingImportFormData } from './types';

export const useFormData = () =>
  useSelector(
    getFormValues(SINGLE_OFFERING_IMPORT_FORM_ID),
  ) as SingleOfferingImportFormData;
