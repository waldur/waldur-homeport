import template from './organization-dashboard.html';

export const organizationDashboard = {
  template,
  bindings: {
    customer: '<'
  },
  controller: class OrganizationDashboardController {
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
      this.DashboardChartService.getOrganizationCharts(this.customer).then(charts => {
        this.charts = charts;
      }).finally(() => {
        this.loading = false;
      });
    }
  }
};
