export default function loadEcharts() {
  return import(/* webpackChunkName: "echarts" */ './echarts');
}
