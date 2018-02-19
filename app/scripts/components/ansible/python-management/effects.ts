import { change, getFormValues, initialize, SubmissionError } from 'redux-form';
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
  initializePythonManagementDetailsDialogue,
  markUnfoldedRequestAsLoaded,
  pythonManagementErred,
  pythonManagementLoaded,
  removeUnfoldedRequest,
  saveUnfoldedRequest,
  triggerRequestOutputPollingTask,
  updatePythonManagement
} from '@waldur/ansible/python-management/actions';
import * as api from '@waldur/ansible/python-management/api';
import { isVirtualEnvironmentNotEditable } from '@waldur/ansible/python-management/form/VirtualEnvironmentUtils';
import {
  buildPythonManagementCreateFormData,
  buildPythonManagementRequestFull,
  buildPythonManagementRequestsFull,
  buildRequestsStatesStateTypePairs
} from '@waldur/ansible/python-management/mappers';
import { getPythonManagementRequestTimeout, getUnfoldedRequests } from '@waldur/ansible/python-management/selectors';
import { PythonManagementFormData } from '@waldur/ansible/python-management/types/PythonManagementFormData';
import { PythonManagementRequest } from '@waldur/ansible/python-management/types/PythonManagementRequest';
import { UnfoldedRequest } from '@waldur/ansible/python-management/types/UnfoldedRequest';
import { VirtualEnvironment } from '@waldur/ansible/python-management/types/VirtualEnvironment';
import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/coreSaga';
import { getProject } from '@waldur/workspace/selectors';

const DETAILS_POLLING_INTERVAL = 20 * 1000;
const DETAILS_FORM_NAME = 'pythonManagementDetails';

export function* handleCreatePythonManagement(action) {
  const successMessage = translate('Python environment has been created.');
  const errorMessage = translate('Python environment could not be created.');
  try {
    const project = yield select(getProject);
    const response = yield call(api.createPythonManagement, action.payload);
    const createdPythonManagement = response.data;
    yield call(api.gotoPythonManagementDetails, createdPythonManagement, project);
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
  yield call(api.goToApplicationsList, project);
}

export function* handleUpdatePythonManagement(action) {
  const successMessage = translate('Virtual environments updates have been scheduled.');
  const errorMessage = translate('Virtual environments requests could not be created.');
  try {
    yield call(api.updatePythonManagement, action.payload);
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
    yield call(api.deletePythonManagement, action.payload);
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
  yield call(api.goToInstanceDetails, action.payload);
}

export function* handleFindVirtualEnvironments(action) {
  const successMessage = translate('Virtual environments search has been scheduled.');
  const errorMessage = translate('Virtual environments search request could not be created.');
  try {
    yield call(api.findVirtualEnvironments, action.payload);
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
    yield call(api.findInstalledLibsInVirtualEnvironment, action.payload);
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
  const pythonManagementResponse = yield call(api.loadPythonManagement, action.payload);
  const availableInstances = yield call(api.loadByUrl, pythonManagementResponse.python_management.instance);
  const pythonManagementFormData = buildPythonManagementCreateFormData(pythonManagementResponse, availableInstances);
  yield put(initialize(DETAILS_FORM_NAME, pythonManagementFormData));
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
  const updatedPythonManagement = yield call(api.loadPythonManagement, pythonManagementUuid);
  yield put(change(
    DETAILS_FORM_NAME,
    'requestsStateTypePairs',
    updatedPythonManagement.python_management.requests_states.map(state => buildRequestsStatesStateTypePairs(state))));
  yield call(mergeVirtualEnvironments, updatedPythonManagement);
  yield call(mergeRequests, updatedPythonManagement);
}

function* mergeRequests(updatedPythonManagement: any) {
  const pythonManagementDetails: PythonManagementFormData = yield select(getFormValues(DETAILS_FORM_NAME));
  const pythonManagementRequestTimeout = yield select(getPythonManagementRequestTimeout);
  const unfoldedRequests = yield select(getUnfoldedRequests);
  const updatedRequests = buildPythonManagementRequestsFull(updatedPythonManagement.requests as any[]);
  const currentRequestsCopy = pythonManagementDetails.requests.slice();
  const newRequestsList = [];
  for (const updatedRequest of updatedRequests) {
    const correspondingExistingRequest = findRequestByUuid(currentRequestsCopy, updatedRequest.uuid);
    if (correspondingExistingRequest && isRequestOpened(correspondingExistingRequest.uuid, unfoldedRequests)) {
      updatedRequest.output = correspondingExistingRequest.output;
      if (hasRequestFinishedExecution(updatedRequest, pythonManagementRequestTimeout) && hasRequestBeenPulling(correspondingExistingRequest, pythonManagementRequestTimeout)) {
        yield call(ensureRequestHasLatestOutput, pythonManagementDetails.uuid, correspondingExistingRequest.uuid);
      }
    }
    newRequestsList.push(updatedRequest);
  }
  yield put(change(DETAILS_FORM_NAME, 'requests', newRequestsList));
}

function findRequestByUuid(requests: PythonManagementRequest[], requestUuid: string) {
  return requests.find(r => r.uuid === requestUuid);
}

function hasRequestBeenPulling(request: PythonManagementRequest, pythonManagementRequestTimeout: number) {
  return PythonManagementRequest.isExecuting(request, pythonManagementRequestTimeout);
}

function* ensureRequestHasLatestOutput(pythonManagementUuid: string, requestUuid: string) {
  const requestWithOutput = yield call(api.loadPythonManagementRequest, pythonManagementUuid, requestUuid);
  yield call(copyAndUpdateRequests, requestUuid, requestWithOutput);
}

function* copyAndUpdateRequests(requestUuid: string, requestWithOutput: any) {
  const pythonManagementDetails: PythonManagementFormData = yield select(getFormValues(DETAILS_FORM_NAME));
  const updatedRequestsCopy = pythonManagementDetails.requests.slice();
  const requestIndex = updatedRequestsCopy.findIndex(request => request.uuid === requestUuid);
  updatedRequestsCopy[requestIndex] = buildPythonManagementRequestFull(requestWithOutput[0]);
  yield put(change(DETAILS_FORM_NAME, 'requests', updatedRequestsCopy));
}

function hasRequestFinishedExecution(updatedRequest: PythonManagementRequest, pythonManagementRequestTimeout: number) {
  return !PythonManagementRequest.isExecuting(updatedRequest, pythonManagementRequestTimeout);
}

function isRequestOpened(requestUuid: string, unfoldedRequests: UnfoldedRequest[]) {
  return unfoldedRequests.some(r => r.requestUuid === requestUuid);
}

function* mergeVirtualEnvironments(updatedPythonManagementPayload: any) {
  const pythonManagementDetails: PythonManagementFormData = yield select(getFormValues(DETAILS_FORM_NAME));
  const pythonManagementRequestTimeout = yield select(getPythonManagementRequestTimeout);
  const virtualEnvironmentsFormCopy = pythonManagementDetails.virtualEnvironments.slice();

  const updatedPythonManagement = buildPythonManagementCreateFormData(updatedPythonManagementPayload, null);

  removeDeletedVirtualEnvironments(virtualEnvironmentsFormCopy, updatedPythonManagement);

  updatedPythonManagement.virtualEnvironments.forEach((virtualEnv, virtualEnvIndex) => {
    const virtualEnvNotEditable = isVirtualEnvironmentNotEditable(pythonManagementDetails, virtualEnvIndex, pythonManagementRequestTimeout);
    if (virtualEnvNotEditable) {
      virtualEnvironmentsFormCopy[virtualEnvIndex] = virtualEnv;
    }
  });
  yield put(change(DETAILS_FORM_NAME, 'virtualEnvironments', virtualEnvironmentsFormCopy));
}

function removeDeletedVirtualEnvironments(virtualEnvironmentsFormCopy: VirtualEnvironment[], updatedPythonManagement: PythonManagementFormData) {
  for (let i = virtualEnvironmentsFormCopy.length - 1; i >= 0; i--) {
    const virtualEnvironment = virtualEnvironmentsFormCopy[i];
    if (virtualEnvironment.uuid && !existsVirtualEnvironment(updatedPythonManagement, virtualEnvironment.name)) {
      virtualEnvironmentsFormCopy.splice(i, 1);
    }
  }
}

function existsVirtualEnvironment(updatedPythonManagement: PythonManagementFormData, name: string) {
  return updatedPythonManagement.virtualEnvironments.some((virtualEnvironment => virtualEnvironment.name === name));
}

function* handleTriggerRequestOutputPollingTask(action) {
  const request: PythonManagementRequest = action.payload;
  const unfoldedRequests = yield select(getUnfoldedRequests);
  const pythonManagementRequestTimeout = yield select(getPythonManagementRequestTimeout);
  const requestUnfolded = unfoldedRequests.some((taskDs: UnfoldedRequest) => taskDs.requestUuid === request.uuid);
  if (requestUnfolded) {
    yield put(removeUnfoldedRequest(request.uuid));
  } else {
    yield put(saveUnfoldedRequest(buildUnfoldedRequest(request)));
    yield call(loadPythonManagementRequestAndSetState, request.uuid);
    while (true) {
      if (!PythonManagementRequest.isExecuting(request, pythonManagementRequestTimeout)) {
        break;
      }
      const raceCondition = yield race({
        task: call(reloadRequestWithDelay, request.uuid),
        requestFolded: take(actionNames.REMOVE_UNFOLDED_REQUEST),
        clearUnfoldedRequests: take(actionNames.CLEAR_UNFOLDED_REQUESTS),
      });
      if (raceCondition.clearUnfoldedRequests
        || (raceCondition.requestFolded && raceCondition.requestFolded.payload.requestUuid === request.uuid)) {
        break;
      }
    }
  }
}

function* reloadRequestWithDelay(requestUuid: string) {
  yield call(delay, DETAILS_POLLING_INTERVAL);
  yield call(loadPythonManagementRequestAndSetState, requestUuid);
}

function buildUnfoldedRequest(request: PythonManagementRequest): UnfoldedRequest {
  const unfoldedRequest = new UnfoldedRequest();
  unfoldedRequest.requestUuid = request.uuid;
  unfoldedRequest.loadingForFirstTime = true;
  return unfoldedRequest;
}

function* loadPythonManagementRequestAndSetState(requestUuid: string) {
  const pythonManagementDetails: PythonManagementFormData = yield select(getFormValues(DETAILS_FORM_NAME));
  const requestWithOutput = yield call(api.loadPythonManagementRequest, pythonManagementDetails.uuid, requestUuid);
  yield call(copyAndUpdateRequests, requestUuid, requestWithOutput);
  yield put(markUnfoldedRequestAsLoaded(requestUuid));
}

export default function* pythonManagementSaga() {
  yield takeEvery(createPythonManagement.REQUEST, handleCreatePythonManagement);
  yield takeEvery(gotoApplicationsList.REQUEST, handleGotoApplicationsList);
  yield takeEvery(updatePythonManagement.REQUEST, handleUpdatePythonManagement);
  yield takeEvery(goToInstanceDetails.REQUEST, handleGoToInstanceDetails);
  yield takeEvery(deletePythonManagement.REQUEST, handleDeletePythonManagement);
  yield takeEvery(findVirtualEnvironments.REQUEST, handleFindVirtualEnvironments);
  yield takeEvery(findInstalledLibsInVirtualEnvironment.REQUEST, handleFindInstalledLibsInVirtualEnvironment);
  yield takeEvery(initializePythonManagementDetailsDialogue.REQUEST, handleInitializePythonManagementDetailsDialogue);
  yield takeEvery(triggerRequestOutputPollingTask.REQUEST, handleTriggerRequestOutputPollingTask);
}
