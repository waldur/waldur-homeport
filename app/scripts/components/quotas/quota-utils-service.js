export default class QuotaUtilsService {
  parseCounters(scope) {
    let counters = {
      app_count: 0,
      vm_count: 0,
      private_cloud_count: 0,
      storage_count: 0,
      allocation_count: 0,
    };
    scope.quotas.forEach(quota => {
      if (quota.name === 'nc_app_count') {
        counters.app_count = quota.usage;
      } else if (quota.name === 'nc_vm_count') {
        counters.vm_count = quota.usage;
      } else if (quota.name === 'nc_private_cloud_count') {
        counters.private_cloud_count = quota.usage;
      } else if (quota.name === 'nc_storage_count') {
        counters.storage_count = quota.usage;
      } else if (quota.name === 'nc_allocation_count') {
        counters.allocation_count = quota.usage;
      } else if (quota.name === 'nc_expert_count') {
        counters.expert_count = quota.usage;
      }
    });
    return counters;
  }
}
