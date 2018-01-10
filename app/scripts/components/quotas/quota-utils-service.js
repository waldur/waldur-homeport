export default class QuotaUtilsService {
  parseCounters(scope) {
    let counters = {
      app_count: 0,
      vm_count: 0,
      private_cloud_count: 0,
      storage_count: 0,
      allocation_count: 0,
      offering_count: 0,
    };
    scope.quotas.forEach(quota => {
      // nc_app_count => app_count
      counters[quota.name.substr(3)] = quota.usage;
    });
    return counters;
  }
}
