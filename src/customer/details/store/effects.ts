import { SubmissionError, reset } from 'redux-form';
import { call, put, takeEvery } from 'redux-saga/effects';

import { translate } from '@waldur/i18n';
import { showSuccess, showError, emitSignal } from '@waldur/store/coreSaga';

import * as actions from './actions';
import * as api from './api';

export function* uploadLogo(action) {
  const { customerUuid, image } = action.payload;
  const successMessage = translate('Logo has been uploaded.');
  const errorMessage = translate('Unable to upload logo.');

  try {
    yield call(api.uploadLogo, {customerUuid, image});
    yield put(emitSignal('refreshCustomer'));
    yield put(actions.uploadLogo.success());
    yield put(showSuccess(successMessage));
  } catch (error) {
    const formError = new SubmissionError({
      _error: errorMessage,
    });

    yield put(actions.uploadLogo.failure(formError));
  }
}

export function* removeLogo(action) {
  const { customer } = action.payload;
  const successMessage = translate('Logo has been removed.');
  const errorMessage = translate('Unable to remove logo.');

  try {
    yield put(reset('customerLogo'));
    if (customer.image) {
      yield call(api.removeLogo, {customerUuid: customer.uuid});
      yield put(emitSignal('refreshCustomer'));
      yield put(showSuccess(successMessage));
    }
  } catch (error) {
    yield put(showError(errorMessage));
  }
}

export default function* customerDetailsSaga() {
  yield takeEvery(actions.uploadLogo.REQUEST, uploadLogo);
  yield takeEvery(actions.removeLogo.REQUEST, removeLogo);
}
