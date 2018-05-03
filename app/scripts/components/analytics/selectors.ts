import { createSelector } from 'reselect';

import { dictToList } from '@waldur/core/utils';
import { isVisible } from '@waldur/store/config';

import * as utils from './utils';

export const getSearchValue = state => state.analytics.searchValue;
export const getLoading = state => state.analytics.loading;
export const getProjects = state => state.analytics.projects;
export const getHistoryQuota = (state, props) => state.analytics.quotasHistory[props.project.uuid];
export const getQuotas = (_, props) => props.project.quotas;
export const getVisibleQuotasFilter = state => quotas => quotas.filter(quota => isVisible(state, quota.name));
export const getLocale = state => state.locale;

export const getProjectsSelector = createSelector(
  getProjects,
  getSearchValue,
  (projects, searchValue) => {
    const resultingProjects = projects.filter(project => project.name.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1);
    return utils.sortProjectsByName(resultingProjects);
  },
);

export const getPieChartsDataSelector = createSelector(
  getQuotas,
  getVisibleQuotasFilter,
  (quotas, quotasVisibilityFilter) => {
    let resultingQuotas = utils.quotasRegitryFilter(quotas);
    resultingQuotas = quotasVisibilityFilter(resultingQuotas);
    resultingQuotas = utils.setQuotasLabel(resultingQuotas);
    resultingQuotas = utils.sortQuotasByLabel(resultingQuotas);
    return utils.getPieChartsData(resultingQuotas);
  },
);

export const getBarChartsDataSelector = createSelector(
  getHistoryQuota,
  getVisibleQuotasFilter,
  getLocale,
  (quotas, quotasVisibilityFilter, locale) => {
    if (!quotas) { return []; }
    let resultingQuotas = dictToList(quotas);
    resultingQuotas = utils.setHistoryQuotasName(resultingQuotas);
    resultingQuotas = quotasVisibilityFilter(resultingQuotas);
    resultingQuotas = utils.setQuotasLabel(resultingQuotas);
    return utils.getBarChartsData(resultingQuotas, locale);
  },
);

export const getExceededQuotasSelector = createSelector(
  getQuotas,
  getVisibleQuotasFilter,
  (quotas, quotasVisibilityFilter) => {
    let resultingQuotas = utils.quotasRegitryFilter(quotas);
    resultingQuotas = quotasVisibilityFilter(resultingQuotas);
    resultingQuotas = utils.setQuotasLabel(resultingQuotas);
    return utils.getExceededQuotas(resultingQuotas);
  }
);
