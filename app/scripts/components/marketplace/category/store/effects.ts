import { call, put, takeEvery } from 'redux-saga/effects';

import { getCategory } from '@waldur/marketplace/common/api';

import * as actions from './actions';
import * as constants from './constants';

function* loadData(action) {
  try {
    const category = yield call(getCategory, action.payload.categoryId);
    yield put(actions.loadDataSuccess(category.sections));
  } catch {
    yield put(actions.loadDataError());
  }
}

export default function*() {
  yield takeEvery(constants.LOAD_DATA_START, loadData);
}
