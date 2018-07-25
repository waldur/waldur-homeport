import { createSelector } from 'reselect';

import { dictToList } from '@waldur/core/utils';
import { isVisible } from '@waldur/store/config';

import * as utils from './utils';

export const getSearchValue = state => state.analytics.searchValue;
export const getLoading = state => state.analytics.loading;
export const getProjects = state => state.analytics.projects;
export const getHistoryQuotas = state => state.analytics.quotasHistory;
export const getTenants = state => state.analytics.tenants;
export const getProjectFromProps = (_, props) => props.project;
export const getLocale = state => state.locale;
export const getVisibleQuotasFilter = state => quotas => quotas.filter(quota => isVisible(state, quota.name));

export const getQuotasSelector = createSelector(
  getTenants,
  getProjectFromProps,
  (tenants, project) => {
    const quotas = tenants
      .filter(tenant => tenant.project_uuid === project.uuid)
      .map(tenant => tenant.quotas);
    return utils.combineQuotas(quotas);
  }
);

export const getHistoryQuotasSelector = createSelector(
  getTenants,
  getHistoryQuotas,
  getProjectFromProps,
  (tenants, historyQuotas, project) => {
    const resultingTenants = tenants.filter(tenant => tenant.project_uuid === project.uuid);
    const resultingQuotas = resultingTenants.map(tenant =>
      utils.setHistoryQuotasName(dictToList(historyQuotas[tenant.uuid])));
    return utils.combineHistoryQuotas(resultingQuotas);
  }
);

export const getProjectsSelector = createSelector(
  getProjects,
  getSearchValue,
  getLocale,
  (projects, searchValue, locale) => {
    const resultingProjects = projects.filter(project => project.name.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1);
    return utils.sortProjectsByName(resultingProjects, locale);
  },
);

export const getMaxSizeNamesSelector = createSelector(
  getQuotasSelector,
  getVisibleQuotasFilter,
  (quotas, quotasVisibilityFilter) => {
    const resultingQuotas = quotasVisibilityFilter(quotas);
    return utils.getMaxFileSizeNames(resultingQuotas);
  },
);

export const getPieChartsDataSelector = createSelector(
  getQuotasSelector,
  getVisibleQuotasFilter,
  getMaxSizeNamesSelector,
  getLocale,
  (quotas, quotasVisibilityFilter, fileSizeNames, locale) => {
    let resultingQuotas = utils.quotasRegitryFilter(quotas);
    resultingQuotas = quotasVisibilityFilter(resultingQuotas);
    resultingQuotas = utils.addRegistryConfig(resultingQuotas);
    resultingQuotas = resultingQuotas.map(quota => ({
      ...quota,
      maxFileSizeName: fileSizeNames[quota.name],
    }));
    resultingQuotas = utils.sortQuotasByLabel(resultingQuotas, locale);
    return utils.getPieChartsData(resultingQuotas);
  },
);

export const getBarChartsDataSelector = createSelector(
  getHistoryQuotasSelector,
  getMaxSizeNamesSelector,
  getLocale,
  (quotas, fileSizeNames, locale) => {
    if (!quotas) { return []; }
    let resultingQuotas = utils.setHistoryQuotasName(quotas);
    resultingQuotas = utils.addRegistryConfig(resultingQuotas);
    resultingQuotas = resultingQuotas.map(quota => ({
      ...quota,
      maxFileSizeName: fileSizeNames[quota.name],
    }));
    resultingQuotas = utils.sortQuotasByLabel(resultingQuotas, locale);
    return utils.getBarChartsData(resultingQuotas);
  },
);

export const getExceededQuotasSelector = createSelector(
  getQuotasSelector,
  getVisibleQuotasFilter,
  (quotas, quotasVisibilityFilter) => {
    let resultingQuotas = utils.quotasRegitryFilter(quotas);
    resultingQuotas = quotasVisibilityFilter(resultingQuotas);
    resultingQuotas = utils.addRegistryConfig(resultingQuotas);
    return utils.getExceededQuotas(resultingQuotas);
  }
);

export const getBarChartsLoadingSelector = createSelector(
  getHistoryQuotasSelector,
  quotas => quotas ? false : true,
);
