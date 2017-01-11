import template from './dashboard-chart.html';

export const dashboardChart = {
  template,
  bindings: {
    chart: '<'
  },
  controller: class DashboardChart {
    $onInit() {
      this.textClass = {
        'text-info': this.chart.change > 0,
        'text-warning': this.chart.change < 0,
        'text-muted': !this.chart.change,
      };

      this.iconClass = {
        'fa-level-up': this.chart.change > 0,
        'fa-level-down': this.chart.change < 0,
        'fa-bolt': !this.chart.change,
      };
    }
  }
};
