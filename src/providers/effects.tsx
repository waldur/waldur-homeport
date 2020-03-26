import { SubmissionError } from 'redux-form';
import { takeEvery, put, call } from 'redux-saga/effects';

import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/coreSaga';

import { updateProvider } from './actions';
import * as api from './api';

export function* handleUpdateProvider(action) {
  const successMessage = translate('Provider has been updated.');
  const errorMessage = translate('Unable to update provider.');

  try {
    yield call(api.updateProvider, action.payload);
    yield put(showSuccess(successMessage));
    yield put(updateProvider.success());
    yield call(api.refreshProjectList);
  } catch (error) {
    const formError = new SubmissionError({
      _error: errorMessage,
    });

    yield put(updateProvider.failure(formError));
  }
}

export default function* providerSaga() {
  yield takeEvery(updateProvider.REQUEST, handleUpdateProvider);
}
