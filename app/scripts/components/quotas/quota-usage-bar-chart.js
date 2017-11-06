import template from './quota-usage-bar-chart.html';

const quotaUsageBarChart = {
  template,
  bindings: {
    quotas: '<',
  },
  controller: class ComponentController {
    // @ngInject
    constructor(coreUtils, $filter) {
      this.coreUtils = coreUtils;
      this.$filter = $filter;
    }

    exceeds(quota) {
      return quota.usage + quota.required > quota.limit;
    }

    getSummary(quota) {
      return this.coreUtils.templateFormatter(gettext('{usage} of {limit} used'), {
        usage: this.$filter('quotaValue')(quota.usage, quota.name),
        limit: this.$filter('quotaValue')(quota.limit, quota.name),
      });
    }

    getExisting(quota) {
      return this.coreUtils.templateFormatter(gettext('Existing quota usage: {usage}'), {
        usage: this.$filter('quotaValue')(quota.usage, quota.name),
      });
    }

    getPlanned(quota) {
      return this.coreUtils.templateFormatter(gettext('Planned quota usage: {usage}'), {
        usage: this.$filter('quotaValue')(quota.required, quota.name),
      });
    }

    getAvailable(quota) {
      let availableQuota = quota.limit - quota.usage;
      return this.coreUtils.templateFormatter(gettext('Available quota usage: {usage}'), {
        usage: this.$filter('quotaValue')(availableQuota, quota.name),
      });
    }

    getExceeds(quota) {
      return this.coreUtils.templateFormatter(gettext('{type} quota usage exceeds available limit.'), {
        type: this.$filter('quotaType')(quota.limitType)
      });
    }
  }
};

export default quotaUsageBarChart;
