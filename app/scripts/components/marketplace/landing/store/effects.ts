import { call, put, takeEvery } from 'redux-saga/effects';

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

export default function*() {
  yield takeEvery(constants.CATEGORIES_FETCH_START, getCategories);
  yield takeEvery(constants.OFFERINGS_FETCH_START, getOfferings);
}
