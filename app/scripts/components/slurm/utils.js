export function loadChartjs() {
  return import(/* webpackChunkName: "chartjs" */ 'chart.js');
}

export function getEstimatedPrice(quotas, pricePackage) {
  const cpu_price = pricePackage.cpu_price * Math.round(quotas.cpu / 60);
  const gpu_price = pricePackage.gpu_price * Math.round(quotas.gpu / 60);
  const ram_price = pricePackage.ram_price * Math.round(quotas.ram / 1024);
  return cpu_price + gpu_price + ram_price;
}
