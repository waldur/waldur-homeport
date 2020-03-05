import {
  reset,
  startSubmit,
  stopSubmit,
  blur,
  formValueSelector,
} from 'redux-form';
import {
  call,
  put,
  take,
  takeEvery,
  takeLatest,
  select,
  race,
} from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import { issueAttachmentsDelete } from '@waldur/issues/attachments/actions';
import {
  ISSUE_ATTACHMENTS_PUT_START,
  ISSUE_ATTACHMENTS_PUT_SUCCESS,
  ISSUE_ATTACHMENTS_PUT_ERROR,
  ISSUE_ATTACHMENTS_PUT_REJECT,
} from '@waldur/issues/attachments/constants';
import { getUploading } from '@waldur/issues/attachments/selectors';
import { Attachment } from '@waldur/issues/attachments/types';
import { showError } from '@waldur/store/coreSaga';

import * as actions from './actions';
import * as api from './api';
import * as constants from './constants';
import {
  getActiveFormId,
  getIssue,
  getPendingAttachments,
  getComments,
} from './selectors';
import * as utils from './utils';

export function* issueCommentsGet(action) {
  const { issueUrl } = action.payload;
  try {
    const response = yield call(api.getComments, issueUrl);
    yield put(actions.issueCommentsGetSuccess(response.data));
  } catch (error) {
    yield put(actions.issueCommentsGetError(error));
    const errorMessage = `${translate('Unable to fetch comments.')} ${format(
      error,
    )}`;
    yield put(showError(errorMessage));
  }
}

export function* issueCommentsCreate(
  formId: string,
  message: string,
  issueId: string,
) {
  try {
    const response = yield call(api.createComment, message, issueId);
    yield put(actions.issueCommentsCreateSuccess(response.data));
  } catch (error) {
    yield put(actions.issueCommentsCreateError(error));
    const errorMessage = `${translate('Unable to post comment.')} ${format(
      error,
    )}`;
    yield put(showError(errorMessage));
    return;
  }
  if (formId) {
    yield put(reset(formId));
  }
  yield put(actions.issueCommentsPendingAttachmentsReset());
  yield put(actions.issueCommentsFormToggle(null));
}

export function* issueCommentsUpdate(message: string, commentId: string) {
  try {
    const response = yield call(api.updateComment, message, commentId);
    yield put(actions.issueCommentsUpdateSuccess(response.data));
  } catch (error) {
    yield put(actions.issueCommentsUpdateError(error));
    const errorMessage = `${translate('Unable to edit comment.')} ${format(
      error,
    )}`;
    yield put(showError(errorMessage));
  }
}

export function* issueCommentsDelete(action) {
  const { commentId } = action.payload;
  try {
    yield call(api.deleteComment, commentId);
    yield put(actions.issueCommentsDeleteSuccess(commentId));
  } catch (error) {
    yield put(actions.issueCommentsDeleteError(error, commentId));
    const errorMessage = `${translate('Unable to delete comment.')} ${format(
      error,
    )}`;
    yield put(showError(errorMessage));
  }
}

export function* issueCommentsFormSubmit(action) {
  const { message, formId } = action.payload;
  yield put(startSubmit(formId));
  yield put(actions.issueCommentsUiDisable(true));
  const comments = yield select(getComments);
  if (!message || !message.length) {
    const errorMessage = translate('Unable to submit empty comment.');
    yield put(showError(errorMessage));
    yield put(actions.issueCommentsFormSubmitReject(formId));
    yield put(stopSubmit(formId));
    yield put(actions.issueCommentsUiDisable(false));
    return;
  }
  yield race({
    sync: call(function*() {
      if (utils.commentExist(comments, formId)) {
        yield call(issueCommentsUpdate, message, formId);
      } else {
        const issue = yield select(getIssue);
        yield call(issueCommentsCreate, formId, message, issue.uuid);
      }
    }),
    cancel: take([
      constants.ISSUE_COMMENTS_FORM_SUBMIT_CANCEL,
      ISSUE_ATTACHMENTS_PUT_START,
    ]),
  });
  yield put(stopSubmit(formId));
  yield put(actions.issueCommentsUiDisable(false));
}

export function* issueCommentsWrapAttachment(attachments: Attachment[]) {
  const issue = yield select(getIssue);
  const commentDescription = utils.createJiraComment(null, attachments);
  yield call(issueCommentsCreate, undefined, commentDescription, issue.uuid);
}

export function* issueCommentsAttachmentsPutStart() {
  yield put(actions.issueCommentsUiDisable(true));
  const activeFormId = yield select(getActiveFormId);
  let count = yield select(getUploading);
  while (count) {
    const result = yield take([
      ISSUE_ATTACHMENTS_PUT_SUCCESS,
      ISSUE_ATTACHMENTS_PUT_ERROR,
      ISSUE_ATTACHMENTS_PUT_REJECT,
    ]);
    if (result.type === ISSUE_ATTACHMENTS_PUT_SUCCESS && activeFormId) {
      const getCommentDescription = formValueSelector(activeFormId);
      let commentDescription = yield select(
        getCommentDescription,
        constants.FORM_FIELDS.comment,
      );
      commentDescription = utils.createJiraComment(commentDescription, [
        result.payload.item,
      ]);
      yield put(
        blur(activeFormId, constants.FORM_FIELDS.comment, commentDescription),
      );
    }
    count = yield select(getUploading);
  }
  const pendingAttachments = yield select(getPendingAttachments);
  if (pendingAttachments.length && !activeFormId) {
    yield call(issueCommentsWrapAttachment, pendingAttachments);
    yield put(actions.issueCommentsPendingAttachmentsReset());
  }
  yield put(actions.issueCommentsUiDisable(false));
}

export function* issueCommentsPendingAttachmentsDelete() {
  const attachments = yield select(getPendingAttachments);
  for (const attachment of attachments) {
    yield put(issueAttachmentsDelete(attachment.uuid));
  }
}

export default function*() {
  yield takeEvery(constants.ISSUE_COMMENTS_GET, issueCommentsGet);
  yield takeEvery(constants.ISSUE_COMMENTS_DELETE, issueCommentsDelete);
  yield takeEvery(
    constants.ISSUE_COMMENTS_FORM_SUBMIT,
    issueCommentsFormSubmit,
  );
  yield takeEvery(
    constants.ISSUE_COMMENTS_PENDING_ATTACHMENTS_DELETE,
    issueCommentsPendingAttachmentsDelete,
  );
  yield takeLatest(
    ISSUE_ATTACHMENTS_PUT_START,
    issueCommentsAttachmentsPutStart,
  );
}
