import { createFormAction } from 'redux-form-saga';

import * as constants from './constants';

export const uploadLogo = createFormAction(constants.UPLOAD_LOGO);
export const removeLogo = createFormAction(constants.REMOVE_LOGO);
