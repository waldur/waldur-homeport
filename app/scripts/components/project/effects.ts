import { SubmissionError } from 'redux-form';
import { takeEvery, put, call, select } from 'redux-saga/effects';

import { getCurrentCustomer } from '@waldur/store/currentCustomer';

import { createProject, gotoProjectList } from './actions';
import * as api from './api';

function* handleCreateProjectSaga(action) {
  try {
    const customer = yield select(getCurrentCustomer);
    const response = yield call(api.createProject, {...action.payload, customer});
    const project = response.data;
    yield call(api.gotoProjectDetails, project);
    yield call(api.refreshProjectList, project);
    yield put(createProject.success());
  } catch (error) {
    const formError = new SubmissionError({
      _error: 'Project could not be created.',
      name: error.data.name,
    });

    yield put(createProject.failure(formError));
  }
}

function* handleGotoProjectListSaga() {
  const customer = yield select(getCurrentCustomer);
  yield call(api.gotoProjectList, customer);
}

export default function* projectSaga() {
  yield takeEvery(createProject.REQUEST, handleCreateProjectSaga);
  yield takeEvery(gotoProjectList.REQUEST, handleGotoProjectListSaga);
}
