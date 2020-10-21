import { call, put, takeEvery } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import * as api from '@waldur/customer/list/api';
import { translate } from '@waldur/i18n';
import { showError, showSuccess, stateGo } from '@waldur/store/coreSaga';

import * as constants from '../constants';

function* organizationUpdate(action) {
  try {
    yield call(api.updateOrganization, action.payload);
    yield put(
      showSuccess(translate('Organization has been updated successfully.')),
    );
    yield put(stateGo('support.customers'));
  } catch (error) {
    const errorMessage = `${translate(
      'Unable to update organization.',
    )} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

export default function* () {
  yield takeEvery(constants.UPDATE_ORGANIZATION, organizationUpdate);
}
