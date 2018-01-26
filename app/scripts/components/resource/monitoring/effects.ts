import { SubmissionError } from 'redux-form';
import { takeEvery, put, call } from 'redux-saga/effects';

import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/coreSaga';

import * as actions from './actions';
import * as api from './api';
import { FETCH_REQUEST } from './constants';

export function* handleFetchHost(action) {
  const { scope } = action.payload;
  try {
    const host = yield call(api.fetchHost, scope);
    yield put(actions.fetchSuccess(host));
  } catch {
    yield put(actions.fetchFailure());
  }
}

function* handleCreateHost(action) {
  const successMessage = translate('Zabbix host has been created.');
  const errorMessage = translate('Zabbix host could not be created.');

  try {
    yield call(api.createHost, action.payload);
    yield put(actions.createHost.success());
    yield put(showSuccess(successMessage));
  } catch (error) {
    const formError = new SubmissionError({
      _error: errorMessage,
    });

    yield put(actions.createHost.failure(formError));
  }
}

function* handleLoadProviders(action) {
  try {
    const response = yield call(api.loadProviders, action.payload);
    yield put(actions.loadProviders.success({options: response.data}));
  } catch (error) {
    yield put(actions.loadProviders.success({options: []}));
  }
}

function* handleLoadTemplates(action) {
  try {
    const response = yield call(api.loadTemplates, action.payload);
    yield put(actions.loadTemplates.success({options: response.data}));
  } catch (error) {
    yield put(actions.loadTemplates.success({options: []}));
  }
}

export default function*() {
  yield takeEvery(FETCH_REQUEST, handleFetchHost);
  yield takeEvery(actions.createHost.REQUEST, handleCreateHost);
  yield takeEvery(actions.loadProviders.REQUEST, handleLoadProviders);
  yield takeEvery(actions.loadTemplates.REQUEST, handleLoadTemplates);
}
