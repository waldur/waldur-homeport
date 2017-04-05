import template from './quota-usage-bar-chart.html';

const quotaUsageBarChart = {
  template,
  bindings: {
    quotas: '<',
  },
  controller: class ComponentController {
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
  }
};

export default quotaUsageBarChart;
