import { call, put, takeEvery, select, spawn } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import { showError } from '@waldur/store/coreSaga';
import { getCustomer } from '@waldur/workspace/selectors';

import * as actions from './actions';
import * as api from './api';
import * as constants from './constants';
import { getProjects } from './selectors';
import * as utils from './utils';

export function* analyticsProjectsFetch() {
  const customer = yield select(getCustomer);
  try {
    const projects = yield call(api.fetchProjects, customer.uuid);
    yield put(actions.analyticsProjectsFetchSuccess(projects));
  } catch (error) {
    yield put(actions.analyticsProjectsFetchError(error));
    const errorMessage = `${translate('Unable to fetch projects.')} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

export function* analyticsHistoryQuotaFetch(projectUuid, quotaUuid) {
  try {
    const data = yield call(api.fetchQuotaHistory, quotaUuid);
    yield put(actions.analyticsHistoryQuotaFetchSuccess(data, projectUuid, quotaUuid));
  } catch (error) {
    yield put(actions.analyticsHistoryQuotaFetchError(error, projectUuid, quotaUuid));
    const errorMessage = `${translate('Unable to fetch quota history.')} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

export function* analiticsGetData() {
  yield call(analyticsProjectsFetch);
  const projects = yield select(getProjects);
  for (const project of projects) {
    const registeredQuotas = utils.quotasRegitryFilter(project.quotas);
    for (const quota of registeredQuotas) {
      yield put(actions.analyticsHistoryQuotaFetch(project.uuid, quota.uuid));
      yield spawn(analyticsHistoryQuotaFetch, project.uuid, quota.uuid);
    }
  }
}

export default function*() {
  yield takeEvery(constants.ANALYTICS_PROJECTS_FETCH, analiticsGetData);
}
