import template from './organization-dashboard.html';

export const organizationDashboard = {
  template,
  bindings: {
    customer: '<'
  },
  controller: class OrganizationDashboardController {
    constructor(DashboardChartService, ENV, $interval) {
      // @ngInject
      this.DashboardChartService = DashboardChartService;
      this.ENV = ENV;
      this.$interval = $interval;
    }

    $onInit() {
      this.loading = true;
      this.pollingPromise = this.startPolling();
    }

    $onDestroy() {
      this.stopPolling();
    }

    startPolling() {
      return this.$interval(this.fetchCharts.bind(this), this.ENV.countersTimerInterval * 1000);
    }

    stopPolling() {
      this.$interval.cancel(this.pollingPromise);
    }

    fetchCharts() {
      this.DashboardChartService.getOrganizationCharts(this.customer).then(charts => {
        this.charts = charts;
      }).finally(() => {
        if (this.loading) {
          this.loading = false;
        }
      });
    }
  }
};
