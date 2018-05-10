import { Action } from '@waldur/core/reducerActions';

import * as constants from './constants';
import { Payload, State } from './types';

const INITIAL_STATE: State = {
  loading: false,
  errors: [],
  projects: [],
  searchValue: '',
  quotasHistory: {},
};

export const reducer = (state: State = INITIAL_STATE, action: Action<Payload>) => {
  const { type, payload } = action;
  switch (type) {
    case constants.ANALYTICS_PROJECTS_FETCH:
      return {
        ...state,
        loading: true,
      };
    case constants.ANALYTICS_PROJECTS_FETCH_SUCCESS:
      return {
        ...state,
        projects: payload.projects,
        loading: false,
      };
    case constants.ANALYTICS_PROJECTS_FETCH_ERROR:
      return {
        ...state,
        errors: [...state.errors, payload.error],
        loading: false,
      };
    case constants.ANALYTICS_SEARCH_FILTER_CHANGE:
      return {
        ...state,
        searchValue: payload.searchValue,
      };
    case constants.ANALYTICS_HISTORY_QUOTA_FETCH:
      return {
        ...state,
        quotasHistory: {
          ...state.quotasHistory,
          [payload.projectUuid]: {
            ...state.quotasHistory[payload.projectUuid],
            [payload.quotaUuid]: {
              loading: true,
              uuid: payload.quotaUuid,
            },
          },
        },
      };
    case constants.ANALYTICS_HISTORY_QUOTA_FETCH_SUCCESS:
      return {
        ...state,
        quotasHistory: {
          ...state.quotasHistory,
          [payload.projectUuid]: {
            ...state.quotasHistory[payload.projectUuid],
            [payload.quotaUuid]: {
              ...state.quotasHistory[payload.projectUuid][payload.quotaUuid],
              loading: false,
              data: payload.quotas,
            },
          },
        },
      };
    case constants.ANALYTICS_HISTORY_QUOTA_FETCH_ERROR:
      return {
        ...state,
        errors: [...state.errors, payload.error],
        quotasHistory: {
          ...state.quotasHistory,
          [payload.projectUuid]: {
            ...state.quotasHistory[payload.projectUuid],
            [payload.quotaUuid]: {
              ...state.quotasHistory[payload.projectUuid][payload.quotaUuid],
              loading: false,
              erred: true,
            },
          },
        },
      };
    default:
      return state;
  }
};
