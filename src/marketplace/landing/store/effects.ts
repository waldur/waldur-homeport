import { call, put, select, takeEvery } from 'redux-saga/effects';

import { $state } from '@waldur/core/services';
import { getWorkspace } from '@waldur/workspace/selectors';
import { WorkspaceType } from '@waldur/workspace/types';

import * as api from '../../common/api';
import * as actions from './actions';
import * as constants from './constants';

function* getCategories() {
  try {
    const categories = yield call(api.getCategories);
    yield put(actions.categoriesFetchSuccess(categories));
  } catch {
    yield put(actions.categoriesFetchError());
  }
}

function* getOfferings() {
  const field = [
    'uuid',
    'name',
    'description',
    'thumbnail',
    'rating',
    'order_item_count',
    'category_uuid',
    'attributes',
    'customer_name',
    'customer_uuid',
  ];
  const params = {
    page_size: 6,
    o: '-created',
    state: 'Active',
    field,
  };
  try {
    const offerings = yield call(api.getOfferingsList, params);
    yield put(actions.offeringsFetchSuccess(offerings));
  } catch {
    yield put(actions.offeringsFetchError());
  }
}

function* gotoOffering(action) {
  const offeringId = action.payload.offeringId;
  const params = {offering_uuid: offeringId};
  const workspace: WorkspaceType = yield select(getWorkspace);
  if (workspace === 'organization') {
    $state.go('marketplace-offering-customer', params);
  } else {
    $state.go('marketplace-offering', params);
  }
}

export default function*() {
  yield takeEvery(constants.CATEGORIES_FETCH_START, getCategories);
  yield takeEvery(constants.OFFERINGS_FETCH_START, getOfferings);
  yield takeEvery(constants.GOTO_OFFERING, gotoOffering);
}
