import { getFormValues, initialize, SubmissionError } from 'redux-form';
import { delay } from 'redux-saga';
import { call, put, race, select, take, takeEvery } from 'redux-saga/effects';

import {
createJupyterHubManagement,
deleteJupyterHubManagement,
initializeJupyterHubManagementCreate,
initializeJupyterHubManagementDetails,
jupyterHubManagementErred,
jupyterHubManagementLoaded,
saveAvailablePythonManagements,
triggerJupyterHubRequestOutputPollingTask,
updateJupyterHubManagement
} from '@waldur/ansible/jupyter-hub-management/actions';
import * as api from '@waldur/ansible/jupyter-hub-management/api';
import {
JUPYTER_HUB_MANAGEMENT_CREATE_FORM_NAME,
JUPYTER_HUB_MANAGEMENT_DETAILS_FORM_NAME
} from '@waldur/ansible/jupyter-hub-management/constants';
import {
buildJupyterHubManagementDetailsFormData,
buildJupyterRequest,
} from '@waldur/ansible/jupyter-hub-management/mappers';
import { JupyterHubManagementDetailsFormData } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementDetailsFormData';
import { JupyterHubManagementFormData } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementFormData';
import { JupyterHubManagementRequest } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementRequest';
import { JupyterHubManagementRequestType } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementRequestType';
import * as actionNames from '@waldur/ansible/python-management/actionNames';
import { findPythonManagementsWithInstance } from '@waldur/ansible/python-management/api';
import {
DETAILS_POLLING_INTERVAL,
mergeRequests,
mergeVirtualEnvironments,
setRequestsStateTypePairs,
startRequestOutputPollingTask
} from '@waldur/ansible/python-management/commonEffects';
import { isExecuting } from '@waldur/ansible/python-management/form/VirtualEnvironmentUtils';
import { getAnsibleRequestTimeout } from '@waldur/ansible/python-management/selectors';
import { ManagementEffectsConfig } from '@waldur/ansible/python-management/types/ManagementEffectsConfig';
import { ManagementRequestState } from '@waldur/ansible/python-management/types/ManagementRequestState';
import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/coreSaga';
import { getProject } from '@waldur/workspace/selectors';

export function* handleCreateJupyterHubManagement(action) {
  const successMessage = translate('JupyterHub environment has been created.');
  const errorMessage = translate('JupyterHub environment could not be created.');
  try {
    const project = yield select(getProject);
    const response = yield call(api.createJupyterHubManagement, action.payload);
    const createdJupyterHubManagement = response.data;
    yield put(jupyterHubManagementErred());
    yield call(api.gotoJupyterHubManagementDetails, createdJupyterHubManagement, project);
    yield put(createJupyterHubManagement.success());
    yield put(showSuccess(successMessage));
  } catch (error) {
    const formError = new SubmissionError({
      _error: errorMessage,
      name: 'Weird error occurred',
    });
    yield put(createJupyterHubManagement.failure(formError));
  }
}

export function* handleUpdateJupyterHubManagement(action) {
  const successMessage = translate('JupyterHub configuration update have been scheduled.');
  const errorMessage = translate('JupyterHub configuration update could not be scheduled.');
  try {
    yield call(api.updateJupyterHubManagement, action.payload);
    yield call(reloadJupyterHubManagementDetails, action.payload.uuid);
    yield put(updateJupyterHubManagement.success());
    yield put(showSuccess(successMessage));
  } catch (error) {
    const formError = new SubmissionError({
      _error: errorMessage,
    });
    yield put(updateJupyterHubManagement.failure(formError));
  }
}

export function* reloadJupyterHubManagementDetails(jupyterHubManagementUuid: string) {
  const updatedJupyterHubManagement = yield call(api.loadJupyterHubManagement, jupyterHubManagementUuid);
  const updatedManagementFormData = buildJupyterHubManagementDetailsFormData(updatedJupyterHubManagement);
  const config = buildJupyterHubManagementConfig();

  yield call(updateOnlyJupyterConfigRelatedFields, updatedManagementFormData);
  yield call(mergeVirtualEnvironments, updatedJupyterHubManagement, config);
  yield call(
    setRequestsStateTypePairs,
    updatedJupyterHubManagement.jupyter_hub_management.state as ManagementRequestState,
    config);
  yield call(mergeRequests, updatedJupyterHubManagement.requests, config);
}

function* updateOnlyJupyterConfigRelatedFields(updatedManagementFormData: JupyterHubManagementDetailsFormData) {
  const requestTimeout = yield select(getAnsibleRequestTimeout);
  const runningSyncConfigRequest = updatedManagementFormData.requests
    .filter(r => r.requestType === JupyterHubManagementRequestType.SYNC_CONFIGURATION)
    .some(r => isExecuting(r, requestTimeout));
  if (runningSyncConfigRequest) {
    const formValues: JupyterHubManagementDetailsFormData = yield select(getFormValues(JUPYTER_HUB_MANAGEMENT_DETAILS_FORM_NAME));
    updatedManagementFormData.requests = formValues.requests;
    updatedManagementFormData.virtualEnvironments = formValues.virtualEnvironments;
    yield put(initialize(JUPYTER_HUB_MANAGEMENT_DETAILS_FORM_NAME, updatedManagementFormData));
  }
}

function buildJupyterHubManagementConfig(): ManagementEffectsConfig<JupyterHubManagementRequest> {
  const config = new ManagementEffectsConfig<JupyterHubManagementRequest>();
  config.formName = JUPYTER_HUB_MANAGEMENT_DETAILS_FORM_NAME;
  config.loadRequestApiCall = api.loadJupyterHubManagementRequest;
  config.requestBuilder = buildJupyterRequest;
  config.formDataBuilder = buildJupyterHubManagementDetailsFormData;
  return config;
}

export function* handleDeleteJupyterHubManagement(action) {
  const successMessage = translate('Virtual environments deletion has been scheduled.');
  const errorMessage = translate('Virtual environments deletion request could not be created.');
  try {
    yield call(api.deleteJupyterHubManagement, action.payload);
    yield call(reloadJupyterHubManagementDetails, action.payload.uuid);
    yield put(deleteJupyterHubManagement.success());
    yield put(showSuccess(successMessage));
  } catch (error) {
    const formError = new SubmissionError({
      _error: errorMessage,
    });
    yield put(deleteJupyterHubManagement.failure(formError));
  }
}

export function* handleInitializeJupyterHubManagementDetailsDialogue(action) {
  try {
    const jupyterHubManagementUuid = action.payload;
    const pythonManagementResponse = yield call(api.loadJupyterHubManagement, jupyterHubManagementUuid);
    yield put(initialize(JUPYTER_HUB_MANAGEMENT_DETAILS_FORM_NAME, buildJupyterHubManagementDetailsFormData(pythonManagementResponse)));
    yield put(jupyterHubManagementLoaded());
    yield call(triggerDetailsPollingTask, jupyterHubManagementUuid);
    yield put(initializeJupyterHubManagementDetails.success());
  } catch (error) {
    yield put(jupyterHubManagementErred());
    yield put(initializeJupyterHubManagementDetails.failure());
  }
}

function* triggerDetailsPollingTask(pythonManagementUuid: string) {
  while (true) {
    const raceCondition = yield race({
      task: call(loadInitializeJupyterHubManagementDetailsWithDelay, pythonManagementUuid),
      cancel: take(actionNames.CLEAR_DETAILS_POLLING_TASK),
    });
    if (raceCondition.cancel) {
      break;
    }
  }
}

function* loadInitializeJupyterHubManagementDetailsWithDelay(pythonManagementUuid: string) {
  yield call(delay, DETAILS_POLLING_INTERVAL);
  yield call(reloadJupyterHubManagementDetails, pythonManagementUuid);
}

function* handleTriggerJupyterHubRequestOutputPollingTask(action) {
  const config = buildJupyterHubManagementConfig();
  const request: JupyterHubManagementRequest = action.payload;
  yield call(startRequestOutputPollingTask, config, request);
}

function* handleInitializeJupyterHubManagementCreate() {
  try {
    const pythonManagementResponse = yield call(findPythonManagementsWithInstance);
    yield put(saveAvailablePythonManagements(pythonManagementResponse));

    yield put(initialize(JUPYTER_HUB_MANAGEMENT_CREATE_FORM_NAME, new JupyterHubManagementFormData()));

    yield put(jupyterHubManagementLoaded());
    yield put(initializeJupyterHubManagementCreate.success());
  } catch (error) {
    yield put(jupyterHubManagementErred());
    yield put(initializeJupyterHubManagementCreate.failure());
  }
}

export default function* jupyterHubManagementSaga() {
  yield takeEvery(createJupyterHubManagement.REQUEST, handleCreateJupyterHubManagement);
  yield takeEvery(updateJupyterHubManagement.REQUEST, handleUpdateJupyterHubManagement);
  yield takeEvery(deleteJupyterHubManagement.REQUEST, handleDeleteJupyterHubManagement);
  yield takeEvery(initializeJupyterHubManagementCreate.REQUEST, handleInitializeJupyterHubManagementCreate);
  yield takeEvery(initializeJupyterHubManagementDetails.REQUEST, handleInitializeJupyterHubManagementDetailsDialogue);
  yield takeEvery(triggerJupyterHubRequestOutputPollingTask.REQUEST, handleTriggerJupyterHubRequestOutputPollingTask);
}
