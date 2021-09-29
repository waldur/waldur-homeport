import { createFormAction } from 'redux-form-saga';

import * as constants from '../constants';

export const updateServiceProviderDescription = createFormAction(
  constants.UPDATE_SERVICE_PROVIDER_DESCRIPTION,
); //
