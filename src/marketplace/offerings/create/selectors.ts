import { formValueSelector } from 'redux-form';

import { FORM_ID } from '../store/constants';

export const offeringCreateFormSelector = formValueSelector(FORM_ID);
