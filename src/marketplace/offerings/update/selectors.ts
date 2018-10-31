import { formValueSelector } from 'redux-form';

import { OFFERING_UPDATE_FORM } from '../store/constants';

export const offeringUpdateFormSelector = formValueSelector(OFFERING_UPDATE_FORM);
