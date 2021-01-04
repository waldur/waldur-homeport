import { formValueSelector } from 'redux-form';

import { RootState } from '@waldur/store/reducers';

const selector = formValueSelector('InvitationCreateDialog');

export const civilNumberSelector = (state: RootState) =>
  selector(state, 'civil_number');

export const taxNumberSelector = (state: RootState) =>
  selector(state, 'tax_number');

export const roleSelector = (state: RootState) => selector(state, 'role');
