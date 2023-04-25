import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';

import {
  getCategory,
  getAllOrganizationGroups,
  getAllPublicOfferings,
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
    const offerings = yield call(getAllPublicOfferings, {
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

function* loadOrganizationGroups() {
  try {
    const organizationGroups = yield call(getAllOrganizationGroups);
    yield put(actions.loadOrganizationGroupsSuccess(organizationGroups));
  } catch {
    yield put(actions.loadOrganizationGroupsError());
  }
}

export default function* () {
  yield takeEvery(constants.LOAD_DATA_START, loadData);
  yield takeLatest(constants.LOAD_OFFERINGS_START, loadOfferings);
  yield takeLatest(
    constants.LOAD_ORGANIZATION_GROUPS_START,
    loadOrganizationGroups,
  );
}
