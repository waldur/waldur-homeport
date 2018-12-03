import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';

import { $state } from '@waldur/core/services';
import { getCategory, getAllOfferings } from '@waldur/marketplace/common/api';

import * as actions from './actions';
import * as constants from './constants';
import { getFilterQuery } from './selectors';

function* loadData() {
  try {
    const category = yield call(getCategory, $state.params.category_uuid);
    yield put(actions.loadDataSuccess(category.sections));
  } catch {
    yield put(actions.loadDataError());
  }
}

function* loadOfferings() {
  const params = yield select(getFilterQuery);

  try {
    const offerings = yield call(getAllOfferings, {
      params: {
        ...params,
        category_uuid: $state.params.category_uuid,
      },
    });
    yield put(actions.loadOfferingsSuccess(offerings));
  } catch {
    yield put(actions.loadOfferingsError());
  }
}

export default function*() {
  yield takeEvery(constants.LOAD_DATA_START, loadData);
  yield takeLatest(constants.LOAD_OFFERINGS_START, loadOfferings);
}
