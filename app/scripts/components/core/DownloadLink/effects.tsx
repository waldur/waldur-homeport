import { takeEvery, put, call } from 'redux-saga/effects';

import { showError, showSuccess } from '@waldur/store/coreSaga';

import { downloadSuccess, downloadFailure } from './actions';
import { downloadFile } from './api';
import { DOWNLOAD_REQUEST } from './constants';

export function* handleDownloadFile(action) {
  const { url, filename } = action.payload;
  try {
    yield put(showSuccess('File download has been started.'));
    yield call(downloadFile, url, filename);
    yield put(downloadSuccess());
    yield put(showSuccess('File has been downloaded.'));
  } catch {
    yield put(downloadFailure());
    yield put(showError('Unable to load file.'));
  }
}

export default function*() {
  yield takeEvery(DOWNLOAD_REQUEST, handleDownloadFile);
}
