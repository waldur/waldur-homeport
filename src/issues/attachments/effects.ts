import { call, put, take, takeEvery, select, spawn, race } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import { ISSUE_COMMENTS_FORM_SUBMIT_CANCEL } from '@waldur/issues/comments/constants';
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
    const message = `${translate('Unable to fetch attachment.')} ${format(error)}`;
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
  const { cancel } = yield race({
    sync: call(function*() {
      try {
        const response = yield call(api.putAttachment, issueUrl, file);
        yield put(actions.issueAttachmentsPutSuccess(response.data));
      } catch (error) {
        yield put(actions.issueAttachmentsPutError(error));
        const message = `${translate('Unable to upload attachment.')} ${format(error)}`;
        yield put(showError(message));
      }
    }),
    cancel: take(ISSUE_COMMENTS_FORM_SUBMIT_CANCEL),
  });
  if (cancel) {
    yield put(actions.issueAttachmentsPutReject());
  }
}

export function* issueAttachmentsDelete(action) {
  const { uuid } = action.payload;
  const deleting = yield select(getDeleting);
  if (deleting[uuid]) { return; }
  try {
    yield put(actions.issueAttachmentsDeleteStart(uuid));
    yield call(api.deleteAttachment, uuid);
    yield put(actions.issueAttachmentsDeleteSuccess(uuid));
  } catch (error) {
    yield put(actions.issueAttachmentsDeleteError(error, uuid));
    const message = `${translate('Unable to delete attachment.')} ${format(error)}`;
    yield put(showError(message));
  }
}

export default function*() {
  yield takeEvery(constants.ISSUE_ATTACHMENTS_GET, issueAttachmentsGet);
  yield takeEvery(constants.ISSUE_ATTACHMENTS_PUT, issueAttachmentsPut);
  yield takeEvery(constants.ISSUE_ATTACHMENTS_DELETE, issueAttachmentsDelete);
}
