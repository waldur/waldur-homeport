import { call, put, takeEvery } from 'redux-saga/effects';

import actions from './actions';
import { fetchChart } from './api';

function* fetchDashboardChart(chartId, scope) {
  try {
    const charts = yield call(fetchChart, chartId, scope);
    yield put(actions.dashboardChartSuccess(chartId, charts));
  } catch (error) {
    yield put(actions.dashboardChartError(chartId, error));
  }
}

export default function* rootSaga(): any {
  yield takeEvery<any>(actions.DASHBOARD_CHARTS_START, ({chartId, scope}) => fetchDashboardChart(chartId, scope));
}
