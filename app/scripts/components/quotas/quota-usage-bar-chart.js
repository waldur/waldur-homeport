import template from './quota-usage-bar-chart.html';

const quotaUsageBarChart = {
  template,
  bindings: {
    quotas: '<',
  },
  controller: function() {
    return {
      exceeds(quota) {
        return quota.usage + quota.required > quota.limit;
      }
    }
  }
};

export default quotaUsageBarChart;
