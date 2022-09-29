import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';

import {
  getCategory,
  getAllOfferings,
  getAllOrganizationDivisions,
} from '@waldur/marketplace/common/api';
import { router } from '@waldur/router';

import * as actions from './actions';
import * as constants from './constants';
import { getFilterQuery } from './selectors';

function* loadData() {
  const categoryId = router.globals.params.category_uuid;
  try {
    const category = yield call(() => getCategory(categoryId));
    yield put(actions.loadDataSuccess(category.sections));
  } catch {
    yield put(actions.loadDataError());
  }
}

function* loadOfferings() {
  const params = yield select(getFilterQuery);
  const categoryId = router.globals.params.category_uuid;

  try {
    const offerings = yield call(getAllOfferings, {
      params: {
        ...params,
        category_uuid: categoryId,
      },
    });
    yield put(actions.loadOfferingsSuccess(offerings));
  } catch {
    yield put(actions.loadOfferingsError());
  }
}

function* loadDivisions() {
  try {
    const divisions = yield call(getAllOrganizationDivisions);
    yield put(actions.loadDivisionsSuccess(divisions));
  } catch {
    yield put(actions.loadDivisionsError());
  }
}

export default function* () {
  yield takeEvery(constants.LOAD_DATA_START, loadData);
  yield takeLatest(constants.LOAD_OFFERINGS_START, loadOfferings);
  yield takeLatest(constants.LOAD_DIVISIONS_START, loadDivisions);
}
