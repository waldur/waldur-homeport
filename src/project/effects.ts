import { triggerTransition } from '@uirouter/redux';
import { SubmissionError } from 'redux-form';
import { takeEvery, put, call, select } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { PROJECTS_LIST } from '@waldur/project/constants';
import { showSuccess, showError } from '@waldur/store/notify';
import {
  deleteEntity,
  fetchListStart,
  FETCH_LIST_START,
} from '@waldur/table/actions';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

import {
  createProject,
  gotoProjectList,
  updateProject,
  GOTO_PROJECT_CREATE,
  DELETE_PROJECT,
  moveProject,
  updateProjectCounters,
} from './actions';
import * as api from './api';
import { getProjectCounters } from './utils';

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
    yield put(triggerTransition('project.details', { uuid: project.uuid }));
    yield put(createProject.success());
    yield put(showSuccess(successMessage));
    yield put(fetchListStart(PROJECTS_LIST));
  } catch (error) {
    const errorData = error?.response?.data;
    const formError = new SubmissionError({
      _error: errorMessage,
      ...errorData,
    });

    yield put(createProject.failure(formError));
  }
}

function* handleGotoProjectCreate() {
  const customer = yield select(getCustomer);
  yield put(
    triggerTransition('organization.createProject', { uuid: customer.uuid }),
  );
}

function* handleGotoProjectList() {
  const customer = yield select(getCustomer);
  yield put(
    triggerTransition('organization.projects', { uuid: customer.uuid }),
  );
}

export function* handleUpdateProject(action) {
  const successMessage = translate('Project has been updated.');
  const errorMessage = translate('Project could not be updated.');

  try {
    const response = yield call(api.updateProject, action.payload);
    const project = response.data;
    yield call(api.dangerouslyUpdateProject, action.payload.cache, project);
    yield put(updateProject.success());
    yield put(showSuccess(successMessage));
    yield put(fetchListStart(PROJECTS_LIST));
  } catch (error) {
    const errorData = error?.response?.data;
    const formError = new SubmissionError({
      _error: errorMessage,
      ...errorData,
    });

    yield put(updateProject.failure(formError));
  }
}

export function* handleMoveProject(action) {
  try {
    yield call(api.moveProject, action.payload);
    yield put(moveProject.success());
    yield put(
      showSuccess(
        translate(
          '{projectName} project has been moved to {organizationName} organization.',
          {
            projectName: action.payload.project.name,
            organizationName: action.payload.organization.name,
          },
        ),
      ),
    );
    yield put(closeModalDialog());
    yield put(fetchListStart(PROJECTS_LIST));
  } catch (error) {
    const errorMessage = `${translate('Project could not be moved.')} ${format(
      error,
    )}`;
    yield put(showError(errorMessage));
    const formError = new SubmissionError({
      _error: errorMessage,
    });
    yield put(moveProject.failure(formError));
  }
}

function* handleProjectDelete(action) {
  const successMessage = translate('Project has been removed successfully.');
  const errorMessage = translate('An error occurred on project removal.');

  const projectId = action.payload.project.uuid;

  try {
    yield call(api.deleteProject, projectId);
    yield put(deleteEntity(PROJECTS_LIST, projectId));
    yield put(showSuccess(successMessage));
    yield put(fetchListStart(PROJECTS_LIST));
  } catch (error) {
    yield put(showError(`${errorMessage} ${format(error)}`));
  }
}

export function* refreshProjectCounters(action) {
  if (action.payload.table.includes('ProjectResourcesList')) {
    const project = yield select(getProject);
    const counters = yield call(getProjectCounters, project, []);
    yield put(updateProjectCounters(counters));
  }
}

export default function* projectSaga() {
  yield takeEvery(createProject.REQUEST, handleCreateProject);
  yield takeEvery(gotoProjectList.REQUEST, handleGotoProjectList);
  yield takeEvery(GOTO_PROJECT_CREATE, handleGotoProjectCreate);
  yield takeEvery(updateProject.REQUEST, handleUpdateProject);
  yield takeEvery(moveProject.REQUEST, handleMoveProject);
  yield takeEvery(DELETE_PROJECT, handleProjectDelete);
  yield takeEvery(FETCH_LIST_START, refreshProjectCounters);
}
