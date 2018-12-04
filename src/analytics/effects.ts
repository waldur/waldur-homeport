import { call, put, takeEvery, select, spawn, fork } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import { showError } from '@waldur/store/coreSaga';
import { getCustomer } from '@waldur/workspace/selectors';

import * as actions from './actions';
import * as api from './api';
import * as constants from './constants';
import * as utils from './utils';

export function* analyticsProjectsFetch() {
  const customer = yield select(getCustomer);
  try {
    const projects = yield call(api.fetchProjects, customer.uuid);
    yield put(actions.analyticsProjectsFetchSuccess(projects));
    return projects;
  } catch (error) {
    yield put(actions.analyticsProjectsFetchError(error));
    const errorMessage = `${translate('Unable to fetch projects.')} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

export function* analyticsTenantsFetch() {
  const customer = yield select(getCustomer);
  try {
    const tenants = yield call(api.fetchTenants, customer.uuid);
    yield put(actions.analyticsTenantsFetchSuccess(tenants));
    return tenants;
  } catch (error) {
    yield put(actions.analyticsProjectsFetchError(error));
    const errorMessage = `${translate('Unable to fetch tenants.')} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

export function* analyticsHistoryQuotaFetch(tenantUuid, quotaUuid) {
  try {
    const data = yield call(api.fetchQuotaHistory, quotaUuid);
    yield put(actions.analyticsHistoryQuotaFetchSuccess(data, tenantUuid, quotaUuid));
  } catch (error) {
    yield put(actions.analyticsHistoryQuotaFetchError(error, tenantUuid, quotaUuid));
    const errorMessage = `${translate('Unable to fetch quota history.')} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

export function* analiticsGetData() {
  yield fork(analyticsProjectsFetch);
  const tenants = yield call(analyticsTenantsFetch);
  for (const tenant of tenants) {
    const registeredQuotas = utils.quotasRegitryFilter(tenant.quotas);
    for (const quota of registeredQuotas) {
      yield put(actions.analyticsHistoryQuotaFetch(tenant.uuid, quota.uuid));
      yield spawn(analyticsHistoryQuotaFetch, tenant.uuid, quota.uuid);
    }
  }
}

export default function*() {
  yield takeEvery(constants.ANALYTICS_PROJECTS_FETCH, analiticsGetData);
}
