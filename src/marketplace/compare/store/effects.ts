import { put, select, takeEvery } from 'redux-saga/effects';

import { translate } from '@waldur/i18n';
import { INIT_CONFIG } from '@waldur/store/config';
import { showError } from '@waldur/store/coreSaga';

import * as actions from './actions';
import * as constants from './constants';
import * as selectors from './selectors';

function* syncItems() {
  const items = yield select(selectors.getItems);
  localStorage.setItem(constants.STORAGE_KEY, JSON.stringify(items));
}

function* restoreItems() {
  const items = localStorage.getItem(constants.STORAGE_KEY);
  if (items) {
    try {
      const parsedItems = JSON.parse(items);
      if (Array.isArray(parsedItems)) {
        yield put(actions.setItems(parsedItems));
      }
    } catch (error) {
      yield put(showError(translate('Unable to restore marketplace comparison.')));
      localStorage.removeItem(constants.STORAGE_KEY);
    }
  }
}

export default function*() {
  yield takeEvery([constants.ADD_ITEM, constants.REMOVE_ITEM], syncItems);
  yield takeEvery(INIT_CONFIG, restoreItems);
}
