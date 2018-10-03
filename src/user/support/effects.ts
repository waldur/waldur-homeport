import { SubmissionError } from 'redux-form';
import { call, put, takeEvery } from 'redux-saga/effects';

import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/coreSaga';
import { updateEntity } from '@waldur/table-react/actions';
import { updateUser } from '@waldur/user/support/actions';

import * as api from './api';

export function* handleUpdateUser(action) {
  const successMessage = translate('User has been updated');
  const errorMessage = translate('User could not been updated');

  try {
    const response = yield call(api.updateUser, action.payload);
    const user = response.data;
    const table = 'userList';
    yield put(updateEntity(table, user.uuid, user));
    yield put(updateUser.success());
    yield put(showSuccess(successMessage));
  } catch (error) {
    const formError = new SubmissionError({
      _error: errorMessage,
    });
    yield put(updateUser.failure(formError));
  }
}

export default function* userSaga() {
  yield takeEvery(updateUser.REQUEST, handleUpdateUser);
}
