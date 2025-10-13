import { call, put, select, takeEvery } from 'redux-saga/effects';

import { ImpersonationStorage } from '@waldur/core/StorageManager';
import {
  clearImpersonationData,
  getCurrentUser,
  setImpersonationData,
} from '@waldur/user/UsersService';
import { setCurrentUser } from '@waldur/workspace/actions';
import { getImpersonatorUser } from '@waldur/workspace/selectors';

import { SET_CURRENT_USER } from './constants';

function* initImpersonation(action) {
  if (!action.payload.user) {
    return;
  }
  if (!action.payload.impersonated) {
    const impersonatorUser = yield select(getImpersonatorUser);
    const storedImpersonatedUserUuid = ImpersonationStorage.get();
    if (!impersonatorUser && storedImpersonatedUserUuid) {
      try {
        setImpersonationData(storedImpersonatedUserUuid);
        const user = yield call(getCurrentUser);
        yield put(setCurrentUser(user, true));
      } catch {
        clearImpersonationData();
      }
    }
  }
}

export default function* workspaceSaga() {
  yield takeEvery(SET_CURRENT_USER, initImpersonation);
}
