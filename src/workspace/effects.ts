import { takeEvery, put, call, select } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import { getCustomer, getProject } from '@waldur/project/api';
import { router } from '@waldur/router';
import { showError } from '@waldur/store/notify';
import {
  clearImpersonationData,
  getCurrentUser,
  setImpersonationData,
} from '@waldur/user/UsersService';
import {
  setCurrentCustomer,
  setCurrentProject,
  setCurrentUser,
} from '@waldur/workspace/actions';
import {
  getCustomer as getCustomerSelector,
  getImpersonatorUser,
  getProject as getProjectSelector,
} from '@waldur/workspace/selectors';

import {
  REFRESH_CURRENT_CUSTOMER,
  SET_CURRENT_CUSTOMER,
  SET_CURRENT_PROJECT,
  SET_CURRENT_USER,
} from './constants';
import { WorkspaceStorage } from './WorkspaceStorage';

function* refreshCurrentCustomer() {
  try {
    const customer = yield select(getCustomerSelector);
    const newCustomer = yield call(getCustomer, customer.uuid);
    yield put(setCurrentCustomer(newCustomer));
  } catch (error) {
    const errorMessage = `${translate(
      'Organization could not be refreshed.',
    )} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

function* initWorkspace(action) {
  if (!action.payload.user) {
    return;
  }
  if (router.globals.current.data?.skipInitWorkspace) {
    return;
  }
  const currentCustomer = yield select(getCustomerSelector);
  const currentProject = yield select(getProjectSelector);

  if (!currentCustomer && !currentProject) {
    const customerId = WorkspaceStorage.getCustomerId();
    if (customerId) {
      try {
        const customer = yield call(getCustomer, customerId);
        yield put(setCurrentCustomer(customer));
      } catch (error) {
        if (error.response?.status === 404) {
          WorkspaceStorage.clearCustomerId();
        }
      }
    }
    const projectId = WorkspaceStorage.getProjectId();
    if (projectId) {
      try {
        const project = yield call(getProject, projectId);
        yield put(setCurrentProject(project));
      } catch (error) {
        if (error.response?.status === 404) {
          WorkspaceStorage.clearProjectId();
        }
      }
    }
  }
}

function* initImpersonation(action) {
  if (!action.payload.user) {
    return;
  }
  if (!action.payload.impersonated) {
    const impersonatorUser = yield select(getImpersonatorUser);
    const storedImpersonatedUserUuid =
      WorkspaceStorage.getImpersonatedUserUuid();
    if (!impersonatorUser && storedImpersonatedUserUuid) {
      try {
        setImpersonationData(storedImpersonatedUserUuid);
        const user = yield call(getCurrentUser);
        yield put(setCurrentUser(user, true));
      } catch (error) {
        clearImpersonationData();
      }
    }
  }
}

function rememberCustomerId(action) {
  const { customer } = action.payload;
  if (customer) WorkspaceStorage.setCustomerId(customer.uuid);
}

function rememberProjectId(action) {
  const { project } = action.payload;
  if (project) WorkspaceStorage.setProjectId(project.uuid);
}

export default function* workspaceSaga() {
  yield takeEvery(REFRESH_CURRENT_CUSTOMER, refreshCurrentCustomer);
  yield takeEvery(SET_CURRENT_USER, initWorkspace);
  yield takeEvery(SET_CURRENT_USER, initImpersonation);
  yield takeEvery(SET_CURRENT_CUSTOMER, rememberCustomerId);
  yield takeEvery(SET_CURRENT_PROJECT, rememberProjectId);
}
