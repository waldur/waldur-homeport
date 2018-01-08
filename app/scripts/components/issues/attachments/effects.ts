import { call, put, takeEvery, select, spawn } from 'redux-saga/effects';

import { format } from '@waldur/core/error-message-formatter';
import { translate } from '@waldur/i18n';
import { showError } from '@waldur/store/coreSaga';

import * as actions from './actions';
import * as api from './api';
import * as constants from './constants';
import { getDeleting, getExludedTypes } from './selectors';
import * as utils from './utils';

export function* issueAttachmentsGet(action) {
  const { issueUrl } = action.payload;
  try {
    const response = yield call(api.getAttachments, issueUrl);
    yield put(actions.issueAttachmentsGetSuccess(response.data));
  } catch (error) {
    yield put(actions.issueAttachmentsGetError(error));
    const message = `${translate('Unable to fetch attachment')}. ${format(error)}`;
    yield put(showError(message));
  }
}

export function* issueAttachmentsPut(action) {
  const { issueUrl, files } = action.payload;
  const excludedTypes = yield select(getExludedTypes);
  const { accepted, rejected } = yield call(utils.validateFiles, files, excludedTypes);

  if (rejected.length) {
    const message = utils.getErrorMessage(rejected);
    yield put(showError(message));
  }
  yield put(actions.issueAttachmentsPutStart(accepted.length));
  for (const file of accepted) {
    yield spawn(issueAttachmentUpload, { issueUrl, file });
  }
}

export function* issueAttachmentUpload(action) {
  const { issueUrl, file } = action;
  try {
    const response = yield call(api.putAttachments, issueUrl, file);
    yield put(actions.issueAttachmentsPutSuccess(response.data));
  } catch (error) {
    yield put(actions.issueAttachmentsPutError(error));
    const message = `${translate('Unable to upload attachment')}. ${format(error)}`;
    yield put(showError(message));
  }
}

export function* issueAttachmentsDelete(action) {
  const { uuid } = action.payload;
  const deleting = yield select(getDeleting);
  if (deleting[uuid]) { return; }
  try {
    yield put(actions.issueAttachmentsDeleteStart(uuid));
    yield call(api.deleteAttachments, uuid);
    yield put(actions.issueAttachmentsDeleteSuccess(uuid));
  } catch (error) {
    yield put(actions.issueAttachmentsDeleteError(error, uuid));
    const message = `${translate('Unable to delete attachment')}. ${format(error)}`;
    yield put(showError(message));
  }
}

export default function*() {
  yield takeEvery(constants.ISSUE_ATTACHMENTS_GET, issueAttachmentsGet);
  yield takeEvery(constants.ISSUE_ATTACHMENTS_PUT, issueAttachmentsPut);
  yield takeEvery(constants.ISSUE_ATTACHMENTS_DELETE, issueAttachmentsDelete);
}
