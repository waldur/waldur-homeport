import { put, select, takeEvery } from 'redux-saga/effects';

import { UserStorage } from '@waldur/marketplace/common/UserStorage';
import { SET_CURRENT_USER } from '@waldur/workspace/constants';
import { getUser } from '@waldur/workspace/selectors';

import * as actions from './actions';
import * as constants from './constants';
import * as selectors from './selectors';

function* syncItems() {
  const user = yield select(getUser);
  const storage = new UserStorage(constants.STORAGE_KEY, user.uuid);
  const items = yield select(selectors.getItems);
  storage.set(items);
}

function* restoreItems() {
  const user = yield select(getUser);
  if (!user) {
    return;
  }
  const storage = new UserStorage(constants.STORAGE_KEY, user.uuid);
  try {
    const parsedItems = storage.get();
    if (Array.isArray(parsedItems)) {
      yield put(actions.setItems(parsedItems));
    }
  } catch (error) {
    storage.remove();
  }
}

export default function* () {
  yield takeEvery([constants.ADD_ITEM, constants.REMOVE_ITEM], syncItems);
  yield takeEvery(SET_CURRENT_USER, restoreItems);
}
