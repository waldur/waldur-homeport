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
      this.loading = null;
    }

    $onInit() {
      this.pollingPromise = this.startPolling();
    }

    $onDestroy() {
      this.$interval.cancel(this.pollingPromise);
    }

    startPolling() {
      this.fetchCharts();
      return this.$interval(this.fetchCharts.bind(this), this.ENV.countersTimerInterval * 1000);
    }

    fetchCharts() {
      if (this.loading === null) {
        this.loading = true;
      }
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
