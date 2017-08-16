// @flow
import type { Chart, Scope } from './types';

const DASHBOARD_CHARTS_START = 'DASHBOARD_CHARTS_START';
const DASHBOARD_CHARTS_STOP = 'DASHBOARD_CHARTS_STOP';
const DASHBOARD_CHARTS_SUCCESS = 'DASHBOARD_CHARTS_SUCCESS';
const DASHBOARD_CHARTS_ERROR = 'DASHBOARD_CHARTS_ERROR';
const EMIT_SIGNAL = 'EMIT_SIGNAL';

const dashboardChartStart = (chartId: string, scope: Scope) => ({
  type: DASHBOARD_CHARTS_START,
  chartId,
  scope,
});

const dashboardChartStop = (chartId: string) => ({
  type: DASHBOARD_CHARTS_STOP,
  chartId,
});

const dashboardChartSuccess = (chartId: string, charts: Array<Chart>) => ({
  type: DASHBOARD_CHARTS_SUCCESS,
  chartId,
  charts,
});

const dashboardChartError = (chartId: string, error: string) => ({
  type: DASHBOARD_CHARTS_ERROR,
  chartId,
  error
});

const emitSignal = (signal: string) => ({
  type: 'EMIT_SIGNAL',
  signal
});

export default {
  DASHBOARD_CHARTS_START,
  DASHBOARD_CHARTS_STOP,
  DASHBOARD_CHARTS_SUCCESS,
  DASHBOARD_CHARTS_ERROR,
  EMIT_SIGNAL,
  dashboardChartStart,
  dashboardChartStop,
  dashboardChartSuccess,
  dashboardChartError,
  emitSignal,
};
