import { SubmissionError } from 'redux-form';
import { call, put, takeEvery } from 'redux-saga/effects';

import { formatDate } from '@waldur/core/dateUtils';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/coreSaga';

import * as api from '../../common/api';
import * as constants from './constants';

function* handleSubmitUsage(action) {
  const {date, resource, ...rest} = action.payload;
  const payload = {
    resource,
    date: formatDate(date),
    usages: Object.keys(rest).map(key => ({
      type: key,
      amount: rest[key],
    })),
  };

  try {
    yield call(api.submitUsageReport, payload);
    yield put(showSuccess(translate('Usage report has been submitted.')));
    yield put(constants.submitUsage.success());
    yield put(closeModalDialog());
  } catch (error) {
    const errorMessage = `${translate('Unable to submit usage report.')} ${format(error)}`;
    yield put(showError(errorMessage));
    const formError = new SubmissionError({
      _error: errorMessage,
      name: 'Unable to submit usage report.',
    });
    yield put(constants.submitUsage.failure(formError));
  }
}

function* handleSwitchPlan(action) {
  const { resource_uuid, plan_url } = action.payload;
  try {
    yield call(api.switchPlan, resource_uuid, plan_url);
    yield put(showSuccess(translate('Resource plan change request has been submitted.')));
    yield put(constants.switchPlan.success());
    yield put(closeModalDialog());
  } catch (error) {
    const errorMessage = `${translate('Unable to submit plan change request.')} ${format(error)}`;
    yield put(showError(errorMessage));
    yield put(constants.switchPlan.success());
  }
}

function* handleTerminateResource(action) {
  const { resource_uuid } = action.payload;
  try {
    yield call(api.terminateResource, resource_uuid);
    yield put(showSuccess(translate('Resource termination request has been submitted.')));
    yield put(constants.terminateResource.success());
    yield put(closeModalDialog());
  } catch (error) {
    const errorMessage = `${translate('Unable to submit resource termination request.')} ${format(error)}`;
    yield put(showError(errorMessage));
    yield put(constants.terminateResource.success());
  }
}

export default function*() {
  yield takeEvery(constants.submitUsage.REQUEST, handleSubmitUsage);
  yield takeEvery(constants.switchPlan.REQUEST, handleSwitchPlan);
  yield takeEvery(constants.terminateResource.REQUEST, handleTerminateResource);
}
