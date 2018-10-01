import { formValueSelector } from 'redux-form';

import { FORM_ID } from './constants';

export const offeringSelector = formValueSelector(FORM_ID);
