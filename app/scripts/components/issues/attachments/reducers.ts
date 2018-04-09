import { Action } from '@waldur/core/reducerActions';

import * as constants from './constants';
import { Payload, State } from './types';

const INITIAL_STATE: State = {
  loading: false,
  errors: [],
  items: [],
  uploading: 0,
  deleting: {},
  filter: constants.ISSUE_ATTACHMENTS_FILTER_NAMES.name,
};

export const reducer = (state: State = INITIAL_STATE, action: Action<Payload>) => {
  const { type, payload } = action;
  switch (type) {
    case constants.ISSUE_ATTACHMENTS_GET:
      return {
        ...state,
        loading: true,
      };
    case constants.ISSUE_ATTACHMENTS_GET_SUCCESS:
      return {
        ...state,
        loading: false,
        items: payload.items,
      };
    case constants.ISSUE_ATTACHMENTS_GET_ERROR:
      return {
        ...state,
        errors: [...state.errors, payload.error],
        loading: false,
      };
    case constants.ISSUE_ATTACHMENTS_PUT_START:
      return {
        ...state,
        uploading: state.uploading + payload.uploading,
      };
    case constants.ISSUE_ATTACHMENTS_PUT_SUCCESS:
      const { uploading } = state;
      return {
        ...state,
        items: [...state.items, payload.item],
        uploading: uploading > 0 ? uploading - 1 : 0,
      };
    case constants.ISSUE_ATTACHMENTS_PUT_ERROR:
      return {
        ...state,
        errors: [...state.errors, payload.error],
        uploading: uploading > 0 ? uploading - 1 : 0,
      };
    case constants.ISSUE_ATTACHMENTS_PUT_REJECT:
      return {
        ...state,
        uploading: uploading > 0 ? uploading - 1 : 0,
      };
    case constants.ISSUE_ATTACHMENTS_DELETE_START:
      return {
        ...state,
        deleting: {
          ...state.deleting,
          [payload.uuid]: true,
        },
      };
    case constants.ISSUE_ATTACHMENTS_DELETE_SUCCESS:
      return {
        ...state,
        items: state.items.filter(item => item.uuid !== payload.uuid),
        deleting: {
          ...state.deleting,
          [payload.uuid]: null,
        },
      };
    case constants.ISSUE_ATTACHMENTS_DELETE_ERROR:
      return {
        ...state,
        deleting: {
          ...state.deleting,
          [payload.uuid]: false,
        },
        errors: [...state.errors, payload.error],
      };
    default:
      return state;
  }
};
