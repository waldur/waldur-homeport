import { createSelector } from 'reselect';

export const getComments = state => state.issues.comments.items;
export const getIsDeleting = (state, props) => !!state.issues.comments.deleting[props.comment.uuid];
export const getIsLoading = state => state.issues.comments.loading;
export const getCommentFormIsOpen = (state, props) => state.issues.comments.activeFormId === props.formId;
export const getActiveFormId = state => state.issues.comments.activeFormId;
export const getIssue = state => state.issues.comments.issue;
export const getPendingAttachments = state => state.issues.comments.pendingAttachments;
export const getIsUiDisabled = state => state.issues.comments.uiDisabled;
export const getCommentsGetErred = state => state.issues.comments.getErred;
export const getIsFormToggleDisabled = (state, props) => state.issues.comments.activeFormId !== null && state.issues.comments.activeFormId !== props.comment.uuid;
export const getUser = state => state.workspace.user;

export const getCommentsSelector = createSelector(
  getComments,
  comments => [...comments].sort((commentA, commentB) =>
    Date.parse(commentB.created) - Date.parse(commentA.created)
  )
);
