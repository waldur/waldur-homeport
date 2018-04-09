import { change, getFormValues } from 'redux-form';
import { delay } from 'redux-saga';
import { call, put, race, select, take } from 'redux-saga/effects';

import * as actionNames from '@waldur/ansible/python-management/actionNames';
import {
markUnfoldedRequestAsLoaded,
removeUnfoldedRequest,
saveUnfoldedRequest
} from '@waldur/ansible/python-management/actions';
import {
isExecuting,
isVirtualEnvironmentNotEditable,
VirtualEnvironmentNotEditableDs
} from '@waldur/ansible/python-management/form/VirtualEnvironmentUtils';
import { getAnsibleRequestTimeout, getUnfoldedRequests } from '@waldur/ansible/python-management/selectors';
import { ManagementEffectsConfig } from '@waldur/ansible/python-management/types/ManagementEffectsConfig';
import { ManagementRequest } from '@waldur/ansible/python-management/types/ManagementRequest';
import { ManagementRequestState } from '@waldur/ansible/python-management/types/ManagementRequestState';
import { UnfoldedRequest } from '@waldur/ansible/python-management/types/UnfoldedRequest';
import { VirtualEnvAndRequestsContainer } from '@waldur/ansible/python-management/types/VirtualEnvAndRequestsContainer';
import { VirtualEnvironment } from '@waldur/ansible/python-management/types/VirtualEnvironment';

export const DETAILS_POLLING_INTERVAL = 12 * 1000;

export function* setRequestsStateTypePairs<R extends ManagementRequest<R>>(
  managementState: ManagementRequestState, config: ManagementEffectsConfig<R>) {
  yield put(change(config.formName, 'managementState', managementState));
}

export function* mergeRequests<R extends ManagementRequest<R>>(
  updatedRequestsPayload: any[], config: ManagementEffectsConfig<R>) {
  const virtualEnvsAndRequestsFormData: VirtualEnvAndRequestsContainer<R> = yield select(getFormValues(config.formName));
  const ansibleRequestTimeout = yield select(getAnsibleRequestTimeout);
  const unfoldedRequests = yield select(getUnfoldedRequests);
  const updatedRequests = updatedRequestsPayload.map(r => config.requestBuilder(r));
  const currentRequestsCopy = virtualEnvsAndRequestsFormData.requests.slice();
  const newRequestsList = [];
  for (const updatedRequest of updatedRequests) {
    const correspondingExistingRequest = findRequestByUuid(currentRequestsCopy, updatedRequest.uuid);
    if (correspondingExistingRequest && isRequestOpened(correspondingExistingRequest.uuid, unfoldedRequests)) {
      updatedRequest.output = correspondingExistingRequest.output;
      if (hasRequestFinishedExecution(updatedRequest, ansibleRequestTimeout) && hasRequestBeenPulling(correspondingExistingRequest, ansibleRequestTimeout)) {
        yield call(ensureRequestHasLatestOutput, virtualEnvsAndRequestsFormData.uuid, correspondingExistingRequest.uuid, config);
      }
    }
    newRequestsList.push(updatedRequest);
  }
  yield put(change(config.formName, 'requests', newRequestsList));
}

function findRequestByUuid<R extends ManagementRequest<R>>(requests: R[], requestUuid: string) {
  return requests.find(r => r.uuid === requestUuid);
}

function hasRequestBeenPulling<R extends ManagementRequest<R>>(request: R, managementRequestTimeout: number) {
  return isExecuting(request, managementRequestTimeout);
}

function* ensureRequestHasLatestOutput<R extends ManagementRequest<R>>(
  managementUuid: string, requestUuid: string, config: ManagementEffectsConfig<R>) {
  const requestWithOutput = yield call(config.loadRequestApiCall, managementUuid, requestUuid);
  yield call(copyAndUpdateRequests, requestUuid, requestWithOutput, config);
}

function* copyAndUpdateRequests<R extends ManagementRequest<R>>(
  requestUuid: string, requestWithOutput: any, config: ManagementEffectsConfig<R>) {
  const virtualEnvsAndRequestsFormData: VirtualEnvAndRequestsContainer<R> = yield select(getFormValues(config.formName));
  const updatedRequestsCopy = virtualEnvsAndRequestsFormData.requests.slice();
  const requestIndex = updatedRequestsCopy.findIndex(request => request.uuid === requestUuid);
  updatedRequestsCopy[requestIndex] = config.requestBuilder(requestWithOutput[0]);
  yield put(change(config.formName, 'requests', updatedRequestsCopy));
}

function hasRequestFinishedExecution<R extends ManagementRequest<R>>(
  updatedRequest: R, managementRequestTimeout: number) {
  return !isExecuting(updatedRequest, managementRequestTimeout);
}

function isRequestOpened(requestUuid: string, unfoldedRequests: UnfoldedRequest[]) {
  return unfoldedRequests.some(r => r.requestUuid === requestUuid);
}

export function* mergeVirtualEnvironments<R extends ManagementRequest<R>>(
  updatedManagementDetailsPayload: any, config: ManagementEffectsConfig<R>) {
  const managementDetails: VirtualEnvAndRequestsContainer<R> = yield select(getFormValues(config.formName));
  const ansibleRequestTimeout = yield select(getAnsibleRequestTimeout);
  const virtualEnvironmentsFormCopy = managementDetails.getVirtualEnvironments(managementDetails).slice();

  const updatedManagementDetails = config.formDataBuilder(updatedManagementDetailsPayload);

  removeDeletedVirtualEnvironments(virtualEnvironmentsFormCopy, updatedManagementDetails);

  updatedManagementDetails.getVirtualEnvironments(updatedManagementDetails).forEach((virtualEnv, virtualEnvIndex) => {
    const virtualEnvNotEditable = isVirtualEnvironmentNotEditable(new VirtualEnvironmentNotEditableDs(managementDetails), virtualEnvIndex, ansibleRequestTimeout);
    if (virtualEnvNotEditable) {
      virtualEnvironmentsFormCopy[virtualEnvIndex] = virtualEnv;
    }
  });
  yield put(change(config.formName, 'virtualEnvironments', virtualEnvironmentsFormCopy));
}

function removeDeletedVirtualEnvironments<R extends ManagementRequest<R>>(
  virtualEnvironmentsFormCopy: VirtualEnvironment[], updatedManagementDetails: VirtualEnvAndRequestsContainer<R>) {
  for (let i = virtualEnvironmentsFormCopy.length - 1; i >= 0; i--) {
    const virtualEnvironment = virtualEnvironmentsFormCopy[i];
    if (virtualEnvironment.uuid && !existsVirtualEnvironment(updatedManagementDetails, virtualEnvironment)) {
      virtualEnvironmentsFormCopy.splice(i, 1);
    }
  }
}

function existsVirtualEnvironment<R extends ManagementRequest<R>>(
  updatedManagementDetails: VirtualEnvAndRequestsContainer<R>, virtualEnvironment: VirtualEnvironment) {
  return updatedManagementDetails.getVirtualEnvironments(updatedManagementDetails).some((ve => ve.name === virtualEnvironment.name || ve.uuid === virtualEnvironment.uuid));
}

function* reloadRequestWithDelay<R extends ManagementRequest<R>>(
  requestUuid: string, config: ManagementEffectsConfig<R>) {
  yield call(delay, DETAILS_POLLING_INTERVAL);
  yield call(loadManagementRequestAndSetState, requestUuid, config);
}

function buildUnfoldedRequest<R extends ManagementRequest<R>>(request: ManagementRequest<R>): UnfoldedRequest {
  const unfoldedRequest = new UnfoldedRequest();
  unfoldedRequest.requestUuid = request.uuid;
  unfoldedRequest.loadingForFirstTime = true;
  return unfoldedRequest;
}

function* loadManagementRequestAndSetState<R extends ManagementRequest<R>>(
  requestUuid: string, config: ManagementEffectsConfig<R>) {
  const virtualEnvAndRequestsFormData: VirtualEnvAndRequestsContainer<R> = yield select(getFormValues(config.formName));
  const requestWithOutput = yield call(config.loadRequestApiCall, virtualEnvAndRequestsFormData.uuid, requestUuid);
  yield call(updateOutputOfTheRequest, requestUuid, requestWithOutput, config);
  yield put(markUnfoldedRequestAsLoaded(requestUuid));
}

function* updateOutputOfTheRequest<R extends ManagementRequest<R>>(requestUuid: string, requestWithOutput: any, config: ManagementEffectsConfig<R>) {
  const virtualEnvsAndRequestsFormData: VirtualEnvAndRequestsContainer<R> = yield select(getFormValues(config.formName));
  const updatedRequestsCopy = virtualEnvsAndRequestsFormData.requests.slice();
  const requestIndex = updatedRequestsCopy.findIndex(request => request.uuid === requestUuid);
  const correspondingRequest = updatedRequestsCopy[requestIndex];

  const copiedRequest = Object.assign( Object.create( Object.getPrototypeOf(correspondingRequest)), correspondingRequest);
  copiedRequest.output = config.requestBuilder(requestWithOutput[0]).output;

  updatedRequestsCopy[requestIndex] = copiedRequest;
  yield put(change(config.formName, 'requests', updatedRequestsCopy));
}

export function* startRequestOutputPollingTask<R extends ManagementRequest<R>>(
  config: ManagementEffectsConfig<R>, request: ManagementRequest<R>) {
  const unfoldedRequests = yield select(getUnfoldedRequests);
  const ansibleRequestTimeout = yield select(getAnsibleRequestTimeout);
  const requestUnfolded = unfoldedRequests.some((taskDs: UnfoldedRequest) => taskDs.requestUuid === request.uuid);
  if (requestUnfolded) {
    yield put(removeUnfoldedRequest(request.uuid));
  } else {
    yield put(saveUnfoldedRequest(buildUnfoldedRequest(request)));
    yield call(loadManagementRequestAndSetState, request.uuid, config);
    while (true) {
      if (!isExecuting(request, ansibleRequestTimeout)) {
        break;
      }
      const raceCondition = yield race({
        task: call(reloadRequestWithDelay, request.uuid, config),
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
