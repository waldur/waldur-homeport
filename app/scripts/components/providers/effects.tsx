import { SubmissionError } from 'redux-form';
import { takeEvery, put, call, select } from 'redux-saga/effects';

import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/coreSaga';
import { getCustomer } from '@waldur/workspace/selectors';

import {
  createProvider,
  gotoProvidersList,
  updateProvider,
  FETCH_PROVIDER_REQUEST,
  fetchProviderSuccess,
  fetchProviderFailure,
} from './actions';
import * as api from './api';

export function* handleCreateProvider(action) {
  const successMessage = translate('Provider has been created.');
  const errorMessage = translate('Unable to create provider, please check your credentials and try again.');

  try {
    const customer = yield select(getCustomer);
    const response = yield call(api.createProvider, {...action.payload, customer});
    const provider = response.data;
    yield put(showSuccess(successMessage));
    yield call(api.refreshProjectList);
    yield call(api.refreshProvidersList);
    yield put(createProvider.success());
    yield call(api.gotoProviderDetails, provider);
  } catch (error) {
    const formError = new SubmissionError({
      _error: errorMessage,
    });

    yield put(createProvider.failure(formError));
  }
}

function* handleGotoProvidersList() {
  const customer = yield select(getCustomer);
  yield call(api.gotoProvidersList, customer);
  yield put(gotoProvidersList.success());
}

function* handleFetchProvider(action) {
  const { uuid } = action.payload;
  try {
    const response = yield call(api.fetchProvider, uuid);
    const { name, state, error_message, ...details } = response.data;
    const provider = {name, state, error_message, details};
    yield put(fetchProviderSuccess(provider));
  } catch {
    yield fetchProviderFailure();
  }
}

export function* handleUpdateProvider(action) {
  const successMessage = translate('Provider has been updated.');
  const errorMessage = translate('Unable to update provider.');

  try {
    yield call(api.updateProvider, action.payload);
    yield put(showSuccess(successMessage));
    yield put(updateProvider.success());
    yield call(api.refreshProjectList);
    yield call(api.refreshProvidersList);
  } catch (error) {
    const formError = new SubmissionError({
      _error: errorMessage,
    });

    yield put(updateProvider.failure(formError));
  }
}

export default function* providerSaga() {
  yield takeEvery(createProvider.REQUEST, handleCreateProvider);
  yield takeEvery(gotoProvidersList.REQUEST, handleGotoProvidersList);
  yield takeEvery(FETCH_PROVIDER_REQUEST, handleFetchProvider);
  yield takeEvery(updateProvider.REQUEST, handleUpdateProvider);
}
