import * as constants from './constants';
import { Project } from './types';

export const analyticsProjectsFetch = () => ({
  type: constants.ANALYTICS_PROJECTS_FETCH,
});

export const analyticsProjectsFetchSuccess = (projects: Project[]) => ({
  type: constants.ANALYTICS_PROJECTS_FETCH_SUCCESS,
  payload: {
    projects,
  },
});

export const analyticsProjectsFetchError = (error: Response) => ({
  type: constants.ANALYTICS_PROJECTS_FETCH_ERROR,
  payload: {
    error,
  },
});

export const analyticsSearchFilterChange = (searchValue: string) => ({
  type: constants.ANALYTICS_SEARCH_FILTER_CHANGE,
  payload: {
    searchValue,
  },
});

export const analyticsHistoryQuotaFetch = (projectUuid: string, quotaUuid: string) => ({
  type: constants.ANALYTICS_HISTORY_QUOTA_FETCH,
  payload: {
    projectUuid,
    quotaUuid,
  },
});

export const analyticsHistoryQuotaFetchSuccess = (quotas: any, projectUuid: string, quotaUuid: string) => ({
  type: constants.ANALYTICS_HISTORY_QUOTA_FETCH_SUCCESS,
  payload: {
    quotas,
    projectUuid,
    quotaUuid,
  },
});

export const analyticsHistoryQuotaFetchError = (error: any, projectUuid: string, quotaUuid: string) => ({
  type: constants.ANALYTICS_HISTORY_QUOTA_FETCH_ERROR,
  payload: {
    error,
    projectUuid,
    quotaUuid,
  },
});
