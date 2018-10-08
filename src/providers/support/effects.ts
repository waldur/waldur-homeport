import { takeEvery, call, put } from 'redux-saga/effects';

import * as actions from './actions';
import * as api from './api';

export function* handleFetchServiceUsage() {
  try {
    const response = yield call(api.loadServiceProviders);
    yield put(actions.fetchServiceUsageDone(response));
  } catch (error) {
    yield put(actions.fetchServiceUsageError(error));
  }
}

export default function* serviceUsageSaga() {
  yield takeEvery(actions.SERVICE_USAGE_FETCH_START, handleFetchServiceUsage);
}
