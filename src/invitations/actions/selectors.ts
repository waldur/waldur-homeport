import { formValueSelector } from 'redux-form';

const selector = formValueSelector('InvitationCreateDialog');

export const civilNumberSelector = (state) => selector(state, 'civil_number');

export const taxNumberSelector = (state) => selector(state, 'tax_number');

export const roleSelector = (state) => selector(state, 'role');
