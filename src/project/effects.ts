import { SubmissionError } from 'redux-form';
import { takeEvery, put, call, select } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import {
  showSuccess,
  stateGo,
  emitSignal,
  showError,
} from '@waldur/store/coreSaga';
import { deleteEntity } from '@waldur/table-react/actions';
import { getCustomer } from '@waldur/workspace/selectors';

import {
  createProject,
  gotoProjectList,
  updateProject,
  GOTO_PROJECT_CREATE,
  DELETE_PROJECT,
} from './actions';
import * as api from './api';

export function* handleCreateProject(action) {
  const successMessage = translate('Project has been created.');
  const errorMessage = translate('Project could not be created.');

  try {
    const customer = yield select(getCustomer);
    const response = yield call(api.createProject, {
      ...action.payload,
      customer,
    });
    const project = response.data;
    yield put(stateGo('project.details', { uuid: project.uuid }));
    yield put(emitSignal('refreshProjectList', { project }));
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

function* handleGotoProjectCreate() {
  const customer = yield select(getCustomer);
  yield put(stateGo('organization.createProject', { uuid: customer.uuid }));
}

function* handleGotoProjectList() {
  const customer = yield select(getCustomer);
  yield put(stateGo('organization.projects', { uuid: customer.uuid }));
}

export function* handleUpdateProject(action) {
  const successMessage = translate('Project has been updated.');
  const errorMessage = translate('Project could not be updated.');

  try {
    const response = yield call(api.updateProject, action.payload);
    const project = response.data;
    yield call(api.dangerouslyUpdateProject, action.payload.cache, project);
    yield put(emitSignal('refreshProjectList', { project }));
    yield put(updateProject.success());
    yield put(showSuccess(successMessage));
  } catch (error) {
    const formError = new SubmissionError({
      _error: errorMessage,
    });

    yield put(updateProject.failure(formError));
  }
}

function* handleProjectDelete(action) {
  const successMessage = translate('Project has been removed successfully.');
  const errorMessage = translate('An error occurred on project removal.');

  const projectId = action.payload.project.uuid;

  try {
    yield call(api.deleteProject, projectId);
    yield put(deleteEntity('ProjectsList', projectId));
    yield put(showSuccess(successMessage));
  } catch (error) {
    yield put(showError(`${errorMessage} ${format(error)}`));
  }
}

export default function* projectSaga() {
  yield takeEvery(createProject.REQUEST, handleCreateProject);
  yield takeEvery(gotoProjectList.REQUEST, handleGotoProjectList);
  yield takeEvery(GOTO_PROJECT_CREATE, handleGotoProjectCreate);
  yield takeEvery(updateProject.REQUEST, handleUpdateProject);
  yield takeEvery(DELETE_PROJECT, handleProjectDelete);
}
