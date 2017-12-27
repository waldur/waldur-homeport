import { SubmissionError } from 'redux-form';
import { takeEvery, put, call } from 'redux-saga/effects';

import { closeModalDialog } from '@waldur/modal/actions';

import { createIssue, refreshIssueList, loadProjectIssues } from './actions';

import * as api from './api';

function* handleCreateIssueSaga(action) {
  try {
    yield call(api.createIssue, action.payload);
    yield put(createIssue.success());
    yield put(refreshIssueList());
    yield put(closeModalDialog());
  } catch (error) {
    const formError = new SubmissionError({
      _error: 'Unable to create request, please check your credentials and try again',
      summary: error.data.summary,
      type: error.data.type,
    });

    yield put(createIssue.failure(formError));
  }
}

function* handleLoadIssuesSaga(action) {
  const response = yield call(api.loadIssues, action.payload);
  try {
    yield put(loadProjectIssues.success({options: response.data}));
  } catch (error) {
    yield put(loadProjectIssues.success({options: []}));
  }
}

export default function* issueSaga() {
  yield takeEvery(createIssue.REQUEST, handleCreateIssueSaga);
  yield takeEvery(loadProjectIssues.REQUEST, handleLoadIssuesSaga);
}
