import { call, put, takeEvery, select } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import { showError } from '@waldur/store/coreSaga';

import * as actions from './actions';
import * as api from './api';
import * as constants from './constants';
import { getResource } from './selectors';

export function* summarySourceFetch(action) {
  const { url } = action.payload;
  const resource = yield select(getResource, { resolve: { url } });
  if (resource && resource.url === url) {
    return;
  }
  yield put(actions.summaryResourceFetchStart());
  try {
    const response = yield call(api.fetchResource, url);
    yield put(actions.summaryResourceFetchSuccess(response.data));
  } catch (error) {
    yield put(actions.summaryResourceFetchError(error));
    const message = `${translate('Unable to fetch attachment.')} ${format(
      error,
    )}`;
    yield put(showError(message));
  }
}

export default function*() {
  yield takeEvery(constants.SUMMARY_RESOURCE_FETCH, summarySourceFetch);
}
