import { Action } from '@waldur/core/reducerActions';
import { omit } from '@waldur/core/utils';
import { ISSUE_ATTACHMENTS_DELETE_SUCCESS, ISSUE_ATTACHMENTS_PUT_SUCCESS } from '@waldur/issues/attachments/constants';

import * as constants from './constants';
import { Payload, State } from './types';

const INITIAL_STATE: State = {
  loading: false,
  errors: [],
  items: [],
  deleting: {},
  activeFormId: null,
  pendingAttachments: [],
  issue: null,
  uiDisabled: false,
  getErred: false,
};

export const reducer = (state: State = INITIAL_STATE, action: Action<Payload>) => {
  const { type, payload } = action;
  switch (type) {
    case constants.ISSUE_COMMENTS_GET:
      return {
        ...state,
        loading: true,
      };
    case constants.ISSUE_COMMENTS_GET_SUCCESS:
      return {
        ...state,
        loading: false,
        getErred: false,
        items: payload.items,
      };
    case constants.ISSUE_COMMENTS_GET_ERROR:
      return {
        ...state,
        loading: false,
        getErred: true,
        errors: [...state.errors, payload.error],
      };
    case constants.ISSUE_COMMENTS_CREATE_SUCCESS:
      return {
        ...state,
        items: [payload.item, ...state.items],
      };
    case constants.ISSUE_COMMENTS_CREATE_ERROR:
      return {
        ...state,
        errors: [...state.errors, payload.error],
      };
    case constants.ISSUE_COMMENTS_UPDATE_SUCCESS:
      return {
        ...state,
        items: state.items.map(item => item.uuid === payload.item.uuid ? payload.item : item),
      };
    case constants.ISSUE_COMMENTS_UPDATE_ERROR:
      return {
        ...state,
        errors: [...state.errors, payload.error],
      };
    case constants.ISSUE_COMMENTS_DELETE:
      return {
        ...state,
        deleting: {
          ...state.deleting,
          [payload.commentId]: true,
        },
      };
    case constants.ISSUE_COMMENTS_DELETE_SUCCESS:
      return {
        ...state,
        deleting: omit(state.deleting, payload.commentId),
        items: state.items.filter(item => item.uuid !== payload.commentId),
      };
    case constants.ISSUE_COMMENTS_DELETE_ERROR:
      return {
        ...state,
        deleting: omit(state.deleting, payload.commentId),
        errors: [...state.errors, payload.error],
      };
    case ISSUE_ATTACHMENTS_PUT_SUCCESS:
      return {
        ...state,
        pendingAttachments: [
          ...state.pendingAttachments,
          payload.item,
        ],
      };
    case ISSUE_ATTACHMENTS_DELETE_SUCCESS:
      return {
        ...state,
        pendingAttachments: state.pendingAttachments.filter(attachment => attachment.uuid !== payload.uuid),
      };
    case constants.ISSUE_COMMENTS_PENDING_ATTACHMENTS_RESET:
      return {
        ...state,
        pendingAttachments: [],
      };
    case constants.ISSUE_COMMENTS_FORM_TOGGLE:
      return {
        ...state,
        activeFormId: state.activeFormId !== payload.formId ? payload.formId : null,
      };
    case constants.ISSUE_COMMENTS_UI_DISABLE:
      return {
        ...state,
        uiDisabled: payload.uiDisabled,
      };
    case constants.ISSUE_COMMENTS_ISSUE_SET:
      return {
        ...state,
        issue: payload.issue,
      };
    default:
      return state;
  }
};
