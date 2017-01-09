import template from './project-dashboard.html';

export const projectDashboard = {
  template,
  bindings: {
    project: '<'
  },
  controller: class ProjectDashboardController {
    constructor(DashboardChartService) {
      // @ngInject
      this.DashboardChartService = DashboardChartService;
    }

    $onInit() {
      this.fetchCharts();
    }

    $onChange() {
      this.fetchCharts();
    }

    fetchCharts() {
      this.loading = true;
      this.DashboardChartService.getProjectCharts(this.project).then(charts => {
        this.charts = charts;
      }).finally(() => {
        this.loading = false;
      });
    }
  }
};
