import * as constants from './constants';
import { Issue, Comment } from './types';

export const issueCommentsGet = (issueUrl: string) => ({
  type: constants.ISSUE_COMMENTS_GET,
  payload: {
    issueUrl,
  },
});

export const issueCommentsGetSuccess = (items: Comment[]) => ({
  type: constants.ISSUE_COMMENTS_GET_SUCCESS,
  payload: {
    items,
  },
});

export const issueCommentsGetError = (error: Response) => ({
  type: constants.ISSUE_COMMENTS_GET_ERROR,
  payload: {
    error,
  },
});

export const issueCommentsCreateSuccess = (item: Comment) => ({
  type: constants.ISSUE_COMMENTS_CREATE_SUCCESS,
  payload: {
    item,
  },
});

export const issueCommentsCreateError = (error: Response) => ({
  type: constants.ISSUE_COMMENTS_CREATE_ERROR,
  payload: {
    error,
  },
});

export const issueCommentsUpdateSuccess = (item: any) => ({
  type: constants.ISSUE_COMMENTS_UPDATE_SUCCESS,
  payload: {
    item,
  },
});

export const issueCommentsUpdateError = (error: Response) => ({
  type: constants.ISSUE_COMMENTS_UPDATE_ERROR,
  payload: {
    error,
  },
});

export const issueCommentsDelete = (commentId: string) => ({
  type: constants.ISSUE_COMMENTS_DELETE,
  payload: {
    commentId,
  },
});

export const issueCommentsDeleteSuccess = (commentId: string) => ({
  type: constants.ISSUE_COMMENTS_DELETE_SUCCESS,
  payload: {
    commentId,
  },
});

export const issueCommentsDeleteError = (error: Response, commentId: string) => ({
  type: constants.ISSUE_COMMENTS_DELETE_ERROR,
  payload: {
    error,
    commentId,
  },
});

export const issueCommentsFormSubmit = (message: string, formId: string) => ({
  type: constants.ISSUE_COMMENTS_FORM_SUBMIT,
  payload: {
    message,
    formId,
  },
});

export const issueCommentsFormSubmitSuccess = (formId: string) => ({
  type: constants.ISSUE_COMMENTS_FORM_SUBMIT_SUCCESS,
  payload: {
    formId,
  },
});

export const issueCommentsFormSubmitReject = (formId: string) => ({
  type: constants.ISSUE_COMMENTS_FORM_SUBMIT_REJECT,
  payload: {
    formId,
  },
});

export const issueCommentsFormSubmitCancel = () => ({
  type: constants.ISSUE_COMMENTS_FORM_SUBMIT_CANCEL,
});

export const issueCommentsFormToggle = (formId: string) => ({
  type: constants.ISSUE_COMMENTS_FORM_TOGGLE,
  payload: {
    formId,
  },
});

export const issueCommentsIssueSet = (issue: Issue) => ({
  type: constants.ISSUE_COMMENTS_ISSUE_SET,
  payload: {
    issue,
  },
});

export const issueCommentsUiDisable = (uiDisabled: boolean) => ({
  type: constants.ISSUE_COMMENTS_UI_DISABLE,
  payload: {
    uiDisabled,
  },
});

export const issueCommentsPendingAttachmentsDelete = () => ({
  type: constants.ISSUE_COMMENTS_PENDING_ATTACHMENTS_DELETE,
});

export const issueCommentsPendingAttachmentsReset = () => ({
  type: constants.ISSUE_COMMENTS_PENDING_ATTACHMENTS_RESET,
});
