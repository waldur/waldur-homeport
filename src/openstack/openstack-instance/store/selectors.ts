import { formValueSelector } from 'redux-form';

import { FORM_ID } from '@waldur/marketplace/details/constants';

export const openstackInstanceCreateFormSelector = formValueSelector(FORM_ID);
