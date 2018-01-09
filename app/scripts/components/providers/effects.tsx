import { SubmissionError } from 'redux-form';
import { takeEvery, put, call, select } from 'redux-saga/effects';

import { showSuccess } from '@waldur/store/coreSaga';
import { getCurrentCustomer } from '@waldur/store/currentCustomer';

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
  try {
    const customer = yield select(getCurrentCustomer);
    const response = yield call(api.createProvider, {...action.payload, customer});
    const provider = response.data;
    yield put(showSuccess('Provider has been created.'));
    yield call(api.refreshProjectList);
    yield call(api.refreshProvidersList);
    yield put(createProvider.success());
    yield call(api.gotoProviderDetails, provider);
  } catch (error) {
    const formError = new SubmissionError({
      _error: 'Unable to create provider, please check your credentials and try again',
    });

    yield put(createProvider.failure(formError));
  }
}

function* handleGotoProvidersList() {
  const customer = yield select(getCurrentCustomer);
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
  try {
    yield call(api.updateProvider, action.payload);
    yield put(showSuccess('Provider has been updated.'));
    yield put(updateProvider.success());
    yield call(api.refreshProjectList);
    yield call(api.refreshProvidersList);
  } catch (error) {
    const formError = new SubmissionError({
      _error: 'Unable to update provider.',
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
