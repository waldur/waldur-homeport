import { takeEvery, put, call } from 'redux-saga/effects';

import { translate } from '@waldur/i18n';
import { showError, showSuccess } from '@waldur/store/coreSaga';

import { downloadSuccess, downloadFailure } from './actions';
import { downloadFile } from './api';
import { DOWNLOAD_REQUEST } from './constants';

export function* handleDownloadFile(action) {
  const requestMessage = translate('File download has been started.');
  const successMessage = translate('File has been downloaded.');
  const errorMessage = translate('Unable to load file.');

  const { url, filename } = action.payload;
  try {
    yield put(showSuccess(requestMessage));
    yield call(downloadFile, url, filename);
    yield put(downloadSuccess());
    yield put(showSuccess(successMessage));
  } catch {
    yield put(downloadFailure());
    yield put(showError(errorMessage));
  }
}

export default function*() {
  yield takeEvery(DOWNLOAD_REQUEST, handleDownloadFile);
}
