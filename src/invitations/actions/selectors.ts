import { formValueSelector } from 'redux-form';

import { RootState } from '@waldur/store/reducers';

export const roleSelector = (state: RootState, formId: string) =>
  formValueSelector(formId)(state, 'role');
