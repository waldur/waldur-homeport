import { Chart, Scope } from './types';

const DASHBOARD_CHARTS_START = 'waldur/dashboard/START';
const DASHBOARD_CHARTS_STOP = 'waldur/dashboard/STOP';
const DASHBOARD_CHARTS_SUCCESS = 'waldur/dashboard/SUCCESS';
const DASHBOARD_CHARTS_ERROR = 'waldur/dashboard/ERROR';
const EMIT_SIGNAL = 'waldur/core/EMIT_SIGNAL';

const dashboardChartStart = (chartId: string, scope: Scope) => ({
  type: DASHBOARD_CHARTS_START,
  chartId,
  scope,
});

const dashboardChartStop = (chartId: string) => ({
  type: DASHBOARD_CHARTS_STOP,
  chartId,
});

const dashboardChartSuccess = (chartId: string, charts: Chart[]) => ({
  type: DASHBOARD_CHARTS_SUCCESS,
  chartId,
  charts,
});

const dashboardChartError = (chartId: string, error: string) => ({
  type: DASHBOARD_CHARTS_ERROR,
  chartId,
  error,
});

const emitSignal = (signal: string) => ({
  type: EMIT_SIGNAL,
  signal,
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
