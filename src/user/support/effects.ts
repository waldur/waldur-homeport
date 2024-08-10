import { SubmissionError } from 'redux-form';
import { call, put, select, takeEvery } from 'redux-saga/effects';

import { queryClient } from '@waldur/Application';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import { showError, showSuccess } from '@waldur/store/notify';
import { deleteEntity, updateEntity } from '@waldur/table/actions';
import {
  updateUser,
  activateUser,
  deactivateUser,
  deleteUser,
} from '@waldur/user/support/actions';
import { setCurrentUser } from '@waldur/workspace/actions';
import { getUser } from '@waldur/workspace/selectors';

import * as api from './api';

const USERS_TABLE = 'userList';

export function* handleUpdateUser(action) {
  const successMessage = translate('User has been updated');
  const errorMessage = translate('User could not been updated');

  try {
    const { uuid, ...values } = action.payload;
    const response = yield call(api.updateUser, uuid, values);
    const user = response.data;

    const currentUser = yield select(getUser);
    if (user.uuid === currentUser.uuid) {
      yield put(setCurrentUser(user));
    }

    yield put(updateEntity(USERS_TABLE, user.uuid, user));
    queryClient.setQueryData(['UserDetails', user.uuid], user);
    yield put(updateUser.success());
    yield put(showSuccess(successMessage));
  } catch (error) {
    const errorData = error?.response?.data;
    const formError = new SubmissionError({
      _error: errorMessage,
      ...errorData,
    });
    yield put(updateUser.failure(formError));
  }
}

function* handleActivateUser(action) {
  try {
    yield call(api.activateUser, action.payload.uuid);
    const user = { ...action.payload, is_active: true };
    yield put(updateEntity(USERS_TABLE, user.uuid, user));
    queryClient.setQueryData(['UserDetails', user.uuid], user);
    yield put(activateUser.success());
    yield put(showSuccess(translate('User has been activated.')));
  } catch (error) {
    yield put(activateUser.failure());
    const errorMessage = `${translate('Unable to activate user.')} ${format(
      error,
    )}`;
    yield put(showError(errorMessage));
  }
}

function* handleDeactivateUser(action) {
  try {
    yield call(api.deactivateUser, action.payload.uuid);
    const user = { ...action.payload, is_active: false };
    yield put(updateEntity(USERS_TABLE, user.uuid, user));
    queryClient.setQueryData(['UserDetails', user.uuid], user);
    yield put(activateUser.success());
    yield put(showSuccess(translate('User has been deactivated.')));
  } catch (error) {
    yield put(activateUser.failure());
    const errorMessage = `${translate('Unable to deactivate user.')} ${format(
      error,
    )}`;
    yield put(showError(errorMessage));
  }
}

function* handleDeleteUser(action) {
  try {
    const userUuid = action.payload.uuid;
    yield call(api.deleteUser, userUuid);
    yield put(deleteEntity(USERS_TABLE, userUuid));
    queryClient.setQueryData(['UserDetails', userUuid], undefined);
    yield put(deleteUser.success());
    yield put(showSuccess(translate('User has been deleted.')));
  } catch (error) {
    yield put(deleteUser.failure());
    const errorMessage = `${translate('Unable to delete user.')} ${format(
      error,
    )}`;
    yield put(showError(errorMessage));
  }
}

export default function* userSaga() {
  yield takeEvery(updateUser.REQUEST, handleUpdateUser);
  yield takeEvery(activateUser.REQUEST, handleActivateUser);
  yield takeEvery(deactivateUser.REQUEST, handleDeactivateUser);
  yield takeEvery(deleteUser.REQUEST, handleDeleteUser);
}
