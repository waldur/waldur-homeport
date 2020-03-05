import { Action } from '@waldur/core/reducerActions';

import * as constants from './constants';
import { Attachment } from './types';

export const issueAttachmentsGet = (
  issueUrl: string,
): Action<{ issueUrl: string }> => ({
  type: constants.ISSUE_ATTACHMENTS_GET,
  payload: {
    issueUrl,
  },
});

export const issueAttachmentsGetSuccess = (
  items: Attachment[],
): Action<{ items: Attachment[] }> => ({
  type: constants.ISSUE_ATTACHMENTS_GET_SUCCESS,
  payload: {
    items,
  },
});

export const issueAttachmentsGetError = (
  error: Response,
): Action<{ error: Response }> => ({
  type: constants.ISSUE_ATTACHMENTS_GET_ERROR,
  payload: {
    error,
  },
});

export const issueAttachmentsPut = (
  issueUrl: string,
  files: File[],
): Action<{ issueUrl: string; files: File[] }> => ({
  type: constants.ISSUE_ATTACHMENTS_PUT,
  payload: {
    issueUrl,
    files,
  },
});

export const issueAttachmentsPutStart = (
  uploading: number,
): Action<{ uploading: number }> => ({
  type: constants.ISSUE_ATTACHMENTS_PUT_START,
  payload: {
    uploading,
  },
});

export const issueAttachmentsPutReject = (): Action<{}> => ({
  type: constants.ISSUE_ATTACHMENTS_PUT_REJECT,
});

export const issueAttachmentsPutSuccess = (
  item: Attachment,
): Action<{ item: Attachment }> => ({
  type: constants.ISSUE_ATTACHMENTS_PUT_SUCCESS,
  payload: {
    item,
  },
});

export const issueAttachmentsPutError = (
  error: Response,
): Action<{ error: Response }> => ({
  type: constants.ISSUE_ATTACHMENTS_PUT_ERROR,
  payload: {
    error,
  },
});

export const issueAttachmentsDelete = (
  uuid: string,
): Action<{ uuid: string }> => ({
  type: constants.ISSUE_ATTACHMENTS_DELETE,
  payload: {
    uuid,
  },
});

export const issueAttachmentsDeleteStart = (
  uuid: string,
): Action<{ uuid: string }> => ({
  type: constants.ISSUE_ATTACHMENTS_DELETE_START,
  payload: {
    uuid,
  },
});

export const issueAttachmentsDeleteSuccess = (
  uuid: string,
): Action<{ uuid: string }> => ({
  type: constants.ISSUE_ATTACHMENTS_DELETE_SUCCESS,
  payload: {
    uuid,
  },
});

export const issueAttachmentsDeleteError = (
  error: Response,
  uuid: string,
): Action<{ error: Response; uuid: string }> => ({
  type: constants.ISSUE_ATTACHMENTS_DELETE_ERROR,
  payload: {
    error,
    uuid,
  },
});
