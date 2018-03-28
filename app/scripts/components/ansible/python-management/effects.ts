import { initialize, SubmissionError } from 'redux-form';
import { delay } from 'redux-saga';
import { call, put, race, select, take, takeEvery } from 'redux-saga/effects';

import * as actionNames from '@waldur/ansible/python-management/actionNames';
import {
createPythonManagement,
deletePythonManagement,
findInstalledLibsInVirtualEnvironment,
findVirtualEnvironments,
gotoApplicationsList,
goToInstanceDetails,
goToPythonManagementDetails,
initializePythonManagementDetailsDialogue,
pythonManagementErred,
pythonManagementLoaded,
triggerRequestOutputPollingTask,
updatePythonManagement
} from '@waldur/ansible/python-management/actions';
import * as pythonManagementApi from '@waldur/ansible/python-management/api';
import {
DETAILS_POLLING_INTERVAL,
mergeRequests,
mergeVirtualEnvironments,
setRequestsStateTypePairs,
startRequestOutputPollingTask
} from '@waldur/ansible/python-management/commonEffects';
import { PYTHON_MANAGEMENT_DETAILS_FORM_NAME } from '@waldur/ansible/python-management/constants';
import {
buildPythonManagementFormData,
buildPythonManagementRequestFull,
} from '@waldur/ansible/python-management/mappers';
import { ManagementEffectsConfig } from '@waldur/ansible/python-management/types/ManagementEffectsConfig';
import { ManagementRequestState } from '@waldur/ansible/python-management/types/ManagementRequestState';
import { PythonManagementRequest } from '@waldur/ansible/python-management/types/PythonManagementRequest';
import { translate } from '@waldur/i18n/index';
import { showSuccess } from '@waldur/store/coreSaga';
import { getProject } from '@waldur/workspace/selectors';

export function* handleCreatePythonManagement(action) {
  const successMessage = translate('Python environment has been created.');
  const errorMessage = translate('Python environment could not be created.');
  try {
    const project = yield select(getProject);
    const response = yield call(pythonManagementApi.createPythonManagement, action.payload);
    const createdPythonManagement = response.data;
    yield call(pythonManagementApi.gotoPythonManagementDetails, createdPythonManagement.uuid, project.uuid);
    yield put(createPythonManagement.success());
    yield put(showSuccess(successMessage));
  } catch (error) {
    const formError = new SubmissionError({
      _error: errorMessage,
    });
    yield put(createPythonManagement.failure(formError));
  }
}

function* handleGotoApplicationsList() {
  const project = yield select(getProject);
  yield call(pythonManagementApi.goToApplicationsList, project);
}

export function* handleUpdatePythonManagement(action) {
  const successMessage = translate('Virtual environments updates have been scheduled.');
  const errorMessage = translate('Virtual environments requests could not be created.');
  try {
    yield call(pythonManagementApi.updatePythonManagement, action.payload);
    yield call(reloadPythonManagementDetails, action.payload.uuid);
    yield put(updatePythonManagement.success());
    yield put(showSuccess(successMessage));
  } catch (error) {
    const formError = new SubmissionError({
      _error: errorMessage,
    });
    yield put(updatePythonManagement.failure(formError));
  }
}

export function* handleDeletePythonManagement(action) {
  const successMessage = translate('Virtual environments deletion has been scheduled.');
  const errorMessage = translate('Virtual environments deletion request could not be created.');
  try {
    yield call(pythonManagementApi.deletePythonManagement, action.payload);
    yield call(reloadPythonManagementDetails, action.payload.uuid);
    yield put(deletePythonManagement.success());
    yield put(showSuccess(successMessage));
  } catch (error) {
    const formError = new SubmissionError({
      _error: errorMessage,
    });
    yield put(deletePythonManagement.failure(formError));
  }
}

export function* handleGoToInstanceDetails(action) {
  yield call(pythonManagementApi.goToInstanceDetails, action.payload);
}

export function* handleGotoPythonManagementDetails(action) {
  const project = yield select(getProject);
  yield call(pythonManagementApi.gotoPythonManagementDetails, action.payload, project.uuid);
}

export function* handleFindVirtualEnvironments(action) {
  const successMessage = translate('Virtual environments search has been scheduled.');
  const errorMessage = translate('Virtual environments search request could not be created.');
  try {
    yield call(pythonManagementApi.findVirtualEnvironments, action.payload);
    yield call(reloadPythonManagementDetails, action.payload);
    yield put(findVirtualEnvironments.success());
    yield put(showSuccess(successMessage));
  } catch (error) {
    const formError = new SubmissionError({
      _error: errorMessage,
    });
    yield put(findVirtualEnvironments.failure(formError));
  }
}

export function* handleFindInstalledLibsInVirtualEnvironment(action) {
  const successMessage = translate('Search for installed libraries in the virtual environment has been scheduled.');
  const errorMessage = translate('Request for search for installed libraries in the virtual environments could not be created.');
  try {
    yield call(pythonManagementApi.findInstalledLibsInVirtualEnvironment, action.payload);
    yield call(reloadPythonManagementDetails, action.payload.pythonManagementUuid);
    yield put(findInstalledLibsInVirtualEnvironment.success());
    yield put(showSuccess(successMessage));
  } catch (error) {
    const formError = new SubmissionError({
      _error: errorMessage,
    });
    yield put(findInstalledLibsInVirtualEnvironment.failure(formError));
  }
}

export function* handleInitializePythonManagementDetailsDialogue(action) {
  try {
    const pythonManagementResponse = yield call(pythonManagementApi.loadPythonManagement, action.payload);
    const availableInstances = pythonManagementResponse.python_management.instance ?
      yield call(pythonManagementApi.loadByUrl, pythonManagementResponse.python_management.instance)
      : undefined;
    const pythonManagementFormData = buildPythonManagementFormData(pythonManagementResponse, availableInstances);
    yield put(initialize(PYTHON_MANAGEMENT_DETAILS_FORM_NAME, pythonManagementFormData));
    yield put(pythonManagementLoaded());
    yield call(triggerDetailsPollingTask, pythonManagementFormData.uuid);
    yield put(initializePythonManagementDetailsDialogue.success());
  } catch (error) {
    yield put(pythonManagementErred());
    yield put(initializePythonManagementDetailsDialogue.failure());
  }
}

function* triggerDetailsPollingTask(pythonManagementUuid: string) {
  while (true) {
    const raceCondition = yield race({
      task: call(reloadPythonManagementDetailsWithDelay, pythonManagementUuid),
      cancel: take(actionNames.CLEAR_DETAILS_POLLING_TASK),
    });
    if (raceCondition.cancel) {
      break;
    }
  }
}

function* reloadPythonManagementDetailsWithDelay(pythonManagementUuid: string) {
  yield call(delay, DETAILS_POLLING_INTERVAL);
  yield call(reloadPythonManagementDetails, pythonManagementUuid);
}

export function* reloadPythonManagementDetails(pythonManagementUuid: string) {
  const updatedPythonManagement = yield call(pythonManagementApi.loadPythonManagement, pythonManagementUuid);
  const config = buildPythonManagementConfig();
  yield call(setRequestsStateTypePairs, updatedPythonManagement.python_management.state as ManagementRequestState, config);
  yield call(mergeVirtualEnvironments, updatedPythonManagement, config);
  yield call(mergeRequests, updatedPythonManagement.requests, config);
}

function buildPythonManagementConfig(): ManagementEffectsConfig<PythonManagementRequest> {
  const config = new ManagementEffectsConfig<PythonManagementRequest>();
  config.formName = PYTHON_MANAGEMENT_DETAILS_FORM_NAME;
  config.loadRequestApiCall = pythonManagementApi.loadPythonManagementRequest;
  config.requestBuilder = buildPythonManagementRequestFull;
  config.formDataBuilder = buildPythonManagementFormData;
  return config;
}

function* handleTriggerRequestOutputPollingTask(action) {
  const config = buildPythonManagementConfig();
  const request: PythonManagementRequest = action.payload;
  yield call(startRequestOutputPollingTask, config, request);
}

export default function* pythonManagementSaga() {
  yield takeEvery(createPythonManagement.REQUEST, handleCreatePythonManagement);
  yield takeEvery(gotoApplicationsList.REQUEST, handleGotoApplicationsList);
  yield takeEvery(updatePythonManagement.REQUEST, handleUpdatePythonManagement);
  yield takeEvery(goToInstanceDetails.REQUEST, handleGoToInstanceDetails);
  yield takeEvery(goToPythonManagementDetails.REQUEST, handleGotoPythonManagementDetails);
  yield takeEvery(deletePythonManagement.REQUEST, handleDeletePythonManagement);
  yield takeEvery(findVirtualEnvironments.REQUEST, handleFindVirtualEnvironments);
  yield takeEvery(findInstalledLibsInVirtualEnvironment.REQUEST, handleFindInstalledLibsInVirtualEnvironment);
  yield takeEvery(initializePythonManagementDetailsDialogue.REQUEST, handleInitializePythonManagementDetailsDialogue);
  yield takeEvery(triggerRequestOutputPollingTask.REQUEST, handleTriggerRequestOutputPollingTask);
}
