import { formValueSelector } from 'redux-form';

import { ORDER_FORM_ID } from './constants';

export const offeringSelector = formValueSelector(ORDER_FORM_ID);
