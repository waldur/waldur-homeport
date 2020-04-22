import template from './quota-usage-bar-chart.html';

const quotaUsageBarChart = {
  template,
  bindings: {
    quotas: '<',
  },
  controller: class ComponentController {
    // @ngInject
    constructor($filter) {
      this.$filter = $filter;
    }

    exceeds(quota) {
      return quota.usage + quota.required > quota.limit;
    }

    getSummary(quota) {
      return translate('{usage} of {limit} used', {
        usage: this.$filter('quotaValue')(quota.usage, quota.name),
        limit: this.$filter('quotaValue')(quota.limit, quota.name),
      });
    }

    getExisting(quota) {
      return translate('Existing quota usage: {usage}', {
        usage: this.$filter('quotaValue')(quota.usage, quota.name),
      });
    }

    getPlanned(quota) {
      return translate('Planned quota usage: {usage}', {
        usage: this.$filter('quotaValue')(quota.required, quota.name),
      });
    }

    getAvailable(quota) {
      const availableQuota = quota.limit - quota.usage;
      return translate('Available quota usage: {usage}', {
        usage: this.$filter('quotaValue')(availableQuota, quota.name),
      });
    }

    getExceeds() {
      return translate('Quota usage exceeds available limit.');
    }
  },
};

export default quotaUsageBarChart;
