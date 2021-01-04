import { createSelector } from 'reselect';

import { RootState } from '@waldur/store/reducers';

export const getComments = (state: RootState) => state.issues.comments.items;
export const getIsDeleting = (state: RootState, props) =>
  !!state.issues.comments.deleting[props.comment.uuid];
export const getIsLoading = (state: RootState) => state.issues.comments.loading;
export const getCommentFormIsOpen = (state: RootState, props) =>
  state.issues.comments.activeFormId === props.formId;
export const getActiveFormId = (state: RootState) =>
  state.issues.comments.activeFormId;
export const getIssue = (state: RootState) => state.issues.comments.issue;
export const getPendingAttachments = (state: RootState) =>
  state.issues.comments.pendingAttachments;
export const getIsUiDisabled = (state: RootState) =>
  state.issues.comments.uiDisabled;
export const getCommentsGetErred = (state: RootState) =>
  state.issues.comments.getErred;
export const getIsFormToggleDisabled = (state: RootState, props) =>
  state.issues.comments.activeFormId !== null &&
  state.issues.comments.activeFormId !== props.comment.uuid;
export const getUser = (state: RootState) => state.workspace.user;

export const getCommentsSelector = createSelector(getComments, (comments) =>
  [...comments].sort(
    (commentA, commentB) =>
      Date.parse(commentB.created) - Date.parse(commentA.created),
  ),
);
