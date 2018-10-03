import * as constants from './constants';
import { Project, Quota } from './types';

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

export const analyticsHistoryQuotaFetch = (tenantUuid: string, quotaUuid: string) => ({
  type: constants.ANALYTICS_HISTORY_QUOTA_FETCH,
  payload: {
    tenantUuid,
    quotaUuid,
  },
});

export const analyticsHistoryQuotaFetchSuccess = (quotas: Quota[], tenantUuid: string, quotaUuid: string) => ({
  type: constants.ANALYTICS_HISTORY_QUOTA_FETCH_SUCCESS,
  payload: {
    quotas,
    tenantUuid,
    quotaUuid,
  },
});

export const analyticsHistoryQuotaFetchError = (error: any, tenantUuid: string, quotaUuid: string) => ({
  type: constants.ANALYTICS_HISTORY_QUOTA_FETCH_ERROR,
  payload: {
    error,
    tenantUuid,
    quotaUuid,
  },
});

export const analyticsTenantsFetch = () => ({
  type: constants.ANALYTICS_TENANTS_FETCH,
});

export const analyticsTenantsFetchSuccess = (tenants: Project[]) => ({
  type: constants.ANALYTICS_TENANTS_FETCH_SUCCESS,
  payload: {
    tenants,
  },
});

export const analyticsTenantsFetchError = (error: Response) => ({
  type: constants.ANALYTICS_TENANTS_FETCH_ERROR,
  payload: {
    error,
  },
});
