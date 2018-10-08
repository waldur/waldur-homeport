import { SubmissionError } from 'redux-form';
import { takeEvery, put, call } from 'redux-saga/effects';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { refreshResource } from '@waldur/resource/actions';
import { showSuccess, showError } from '@waldur/store/coreSaga';

import * as actions from './actions';
import * as api from './api';
import { FETCH_REQUEST, DELETE_REQUEST } from './constants';

export function* handleFetchHost(action) {
  const { uuid } = action.payload;
  try {
    const host = yield call(api.fetchHost, uuid);
    yield put(actions.fetchSuccess(host));
  } catch {
    yield put(actions.fetchFailure());
  }
}

export function* handleDeleteHost(action) {
  const successMessage = translate('Zabbix host has been deleted.');
  const errorMessage = translate('Zabbix host could not be deleted.');

  const { uuid } = action.payload;
  try {
    yield call(api.deleteHost, uuid);
    yield put(closeModalDialog());
    yield put(showSuccess(successMessage));
    yield refreshResource();
  } catch {
    yield put(showError(errorMessage));
    yield put(actions.deleteFailure());
  }
}

function* handleCreateHost(action) {
  const successMessage = translate('Zabbix host has been created.');
  const errorMessage = translate('Zabbix host could not be created.');

  try {
    yield call(api.createHost, action.payload);
    yield put(actions.createHost.success());
    yield put(showSuccess(successMessage));
    yield put(closeModalDialog());
    yield refreshResource();
  } catch (error) {
    const formError = new SubmissionError({
      _error: errorMessage,
    });

    yield put(actions.createHost.failure(formError));
  }
}

function* handleLoadLinks(action) {
  try {
    const options = yield call(api.loadLinks, action.payload);
    yield put(actions.loadLinks.success({options}));
  } catch (error) {
    yield put(actions.loadLinks.success({options: []}));
  }
}

function* handleLoadTemplates(action) {
  try {
    const options = yield call(api.loadTemplates, action.payload);
    yield put(actions.loadTemplates.success({options}));
  } catch (error) {
    yield put(actions.loadTemplates.success({options: []}));
  }
}

export default function*() {
  yield takeEvery(FETCH_REQUEST, handleFetchHost);
  yield takeEvery(DELETE_REQUEST, handleDeleteHost);
  yield takeEvery(actions.createHost.REQUEST, handleCreateHost);
  yield takeEvery(actions.loadLinks.REQUEST, handleLoadLinks);
  yield takeEvery(actions.loadTemplates.REQUEST, handleLoadTemplates);
}
