import { SubmissionError } from 'redux-form';
import { takeEvery, put, call } from 'redux-saga/effects';

import { createIssue } from './actions';
import { createIssueApi } from './api';

function* handleCreateIssueSaga(action) {
  try {
    yield call(createIssueApi, action.payload);
    yield put(createIssue.success());
  } catch (error) {
    const formError = new SubmissionError({
      _error: 'Unable to create request, please check your credentials and try again',
      summary: error.data.summary,
      type: error.data.type,
    });

    yield put(createIssue.failure(formError));
  }
}

export default function* createIssueWatcherSaga() {
  yield takeEvery(createIssue.REQUEST, handleCreateIssueSaga);
}
