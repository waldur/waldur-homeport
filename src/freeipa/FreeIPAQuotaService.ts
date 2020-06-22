import { patch } from '@waldur/core/api';
import { isFeatureVisible } from '@waldur/features/connect';

export const FreeIPAQuotaService = {
  findQuota(scope) {
    return scope.quotas.filter((quota) => quota.name === 'freeipa_quota')[0];
  },

  loadQuota(scope) {
    if (isFeatureVisible('freeipa')) {
      const quota = this.findQuota(scope);
      if (quota) {
        return { ...quota, unlimited: quota.limit === -1 };
      }
    }
  },

  saveQuota(scope, quota) {
    if (quota.unlimited) {
      quota.limit = -1;
    }
    return patch(`/quotas/${quota.uuid}/`, {
      limit: quota.limit,
    }).then(() => {
      this.findQuota(scope).limit = quota.limit;
    });
  },
};
