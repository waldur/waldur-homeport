import { SubmissionError } from 'redux-form';
import { call, put, takeEvery } from 'redux-saga/effects';

import { formatDate } from '@waldur/core/dateUtils';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/coreSaga';

import { submitUsageReport } from '../../common/api';
import * as constants from './constants';

function* submitUsage(action) {
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
    yield call(submitUsageReport, payload);
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

export default function*() {
  yield takeEvery(constants.submitUsage.REQUEST, submitUsage);
}
