import template from './project-dashboard.html';

export const projectDashboard = {
  template,
  bindings: {
    project: '<'
  },
  controller: class ProjectDashboardController {
    constructor(DashboardChartService, $interval, ENV) {
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
      this.DashboardChartService.getProjectCharts(this.project).then(charts => {
        this.charts = charts;
      }).finally(() => {
        this.loading = false;
      });
    }
  }
};
