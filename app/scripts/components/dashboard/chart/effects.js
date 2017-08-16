// @flow
import { delay, takeEvery } from 'redux-saga';
import { call, take, put, cancel, fork } from 'redux-saga/effects';

import api from './api';
import actions from './actions';

const CHART_PULLING_INTERVAL = 60 * 1000;

function* pullDashboardChart(chartId, scope) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const charts = yield call(api.fetchChart, chartId, scope);
      yield put(actions.dashboardChartSuccess(chartId, charts));
    } catch(error) {
      yield put(actions.dashboardChartError(chartId, error));
    }
    yield call(delay, CHART_PULLING_INTERVAL);
  }
}

function* startDashboardChart({ chartId, scope }) {
  const task = yield fork(pullDashboardChart, chartId, scope);

  yield take(action => action.type === actions.DASHBOARD_CHARTS_STOP && action.chartId === chartId);

  yield cancel(task);
}

function* watchEmit() {
  yield takeEvery(actions.EMIT_SIGNAL, action => api.emitSignal(action.signal));
}

function* rootSaga():any {
  yield takeEvery(actions.DASHBOARD_CHARTS_START, startDashboardChart);
  yield fork(watchEmit);
}

export default rootSaga;
