import { takeEvery, put, call } from 'redux-saga/effects';

import { fetchSuccess, fetchFailure } from './actions';
import { fetchHost } from './api';
import { FETCH_REQUEST } from './constants';

export function* handleFetchMonitoring(action) {
  const { scope } = action.payload;
  try {
    const host = yield call(fetchHost, scope);
    yield put(fetchSuccess(host));
  } catch {
    yield put(fetchFailure());
  }
}

export default function*() {
  yield takeEvery(FETCH_REQUEST, handleFetchMonitoring);
}
