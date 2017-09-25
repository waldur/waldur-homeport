export function loadChartjs() {
  return import(/* webpackChunkName: "chartjs" */ 'chart.js');
}
