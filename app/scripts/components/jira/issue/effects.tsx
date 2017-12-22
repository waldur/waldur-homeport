import { SubmissionError } from 'redux-form';
import { takeEvery, put, call } from 'redux-saga/effects';

import { $http, ENV } from '@waldur/core/services';

import { createIssue } from './actions';

function* handleCreateIssueSaga(action) {
  try {
    yield call($http.post, `${ENV.apiEndpoint}api/jira-issues/`, {
      project: action.payload.project.url,
      type: action.payload.type.url,
      summary: action.payload.summary,
      description: action.payload.description,
      impact: 'n/a',
      priority: 'n/a',
    });

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
