import { SubmissionError } from 'redux-form';
import { takeEvery, put, call, select } from 'redux-saga/effects';

import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/coreSaga';
import { getCustomer } from '@waldur/workspace/selectors';

import { createProject, gotoProjectList, updateProject } from './actions';
import * as api from './api';

export function* handleCreateProject(action) {
  const successMessage = translate('Project has been created.');
  const errorMessage = translate('Project could not be created.');

  try {
    const customer = yield select(getCustomer);
    const response = yield call(api.createProject, {...action.payload, customer});
    const project = response.data;
    yield call(api.gotoProjectDetails, project);
    yield call(api.refreshProjectList, project);
    yield put(createProject.success());
    yield put(showSuccess(successMessage));
  } catch (error) {
    const formError = new SubmissionError({
      _error: errorMessage,
      name: error.data.name,
    });

    yield put(createProject.failure(formError));
  }
}

function* handleGotoProjectList() {
  const customer = yield select(getCustomer);
  yield call(api.gotoProjectList, customer);
}

export function* handleUpdateProject(action) {
  const successMessage = translate('Project has been updated.');
  const errorMessage = translate('Project could not be updated.');

  try {
    const response = yield call(api.updateProject, action.payload);
    const project = response.data;
    yield call(api.dangerouslyUpdateProject, action.payload.cache, project);
    yield call(api.refreshProjectList, project);
    yield put(updateProject.success());
    yield put(showSuccess(successMessage));
  } catch (error) {
    const formError = new SubmissionError({
      _error: errorMessage,
    });

    yield put(updateProject.failure(formError));
  }
}

export default function* projectSaga() {
  yield takeEvery(createProject.REQUEST, handleCreateProject);
  yield takeEvery(gotoProjectList.REQUEST, handleGotoProjectList);
  yield takeEvery(updateProject.REQUEST, handleUpdateProject);
}
