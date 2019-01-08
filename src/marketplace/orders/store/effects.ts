import { SubmissionError } from 'redux-form';
import { call, put, takeEvery } from 'redux-saga/effects';

import { formatDate } from '@waldur/core/dateUtils';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/coreSaga';

import { submitUsageReport } from '../../common/api';
import * as actions from './actions';
import * as constants from './constants';

function* setOrderState(action) {
  const { orderUuid } = action.payload;
  try {
    yield put(actions.setOrderStateChangeStatus({processing: true}));
    yield call(api.approveOrder, orderUuid);
    yield put(showSuccess(translate('Order has been approved.')));
    yield put(actions.setOrderStateChangeStatus({processing: false, processed: true}));
  } catch (error) {
    yield put(actions.setOrderStateChangeStatus({processing: false, processed: false}));
    const errorMessage = `${translate('Unable to approve order.')} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

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
  yield takeEvery(constants.APPROVE_ORDER, setOrderState);
  yield takeEvery(constants.submitUsage.REQUEST, submitUsage);
}
