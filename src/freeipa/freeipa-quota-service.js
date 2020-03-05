export default class FreeIPAQuotaService {
  // @ngInject
  constructor(quotasService, features) {
    this.quotasService = quotasService;
    this.features = features;
  }

  findQuota(scope) {
    return scope.quotas.filter(quota => quota.name === 'freeipa_quota')[0];
  }

  loadQuota(scope) {
    if (this.features.isVisible('freeipa')) {
      const quota = this.findQuota(scope);
      if (quota) {
        const context = {
          unlimited: quota.limit === -1,
        };
        return angular.extend({}, quota, context);
      }
    }
  }

  saveQuota(scope, quota) {
    if (quota.unlimited) {
      quota.limit = -1;
    }
    return this.quotasService
      .update({
        url: quota.url,
        limit: quota.limit,
      })
      .then(() => {
        this.findQuota(scope).limit = quota.limit;
      });
  }
}
