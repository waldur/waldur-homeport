import { call, put, takeEvery } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/issues/security-incident/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/notify';

import * as constants from '../constants';

function* reportIncident(action) {
  try {
    yield call(api.reportSecurityIncident, {
      ...action.payload,
    });
    yield put(showSuccess('Security incident has been successfully reported.'));
    yield put(closeModalDialog());
  } catch (error) {
    const errorMessage = `${translate(
      'Unable to report security incident.',
    )} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

export default function* () {
  yield takeEvery(constants.REPORT_INCIDENT, reportIncident);
}
