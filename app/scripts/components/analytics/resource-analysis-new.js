import template from './resource-analysis-new.html';

const resourceAnalysis = {
  template,
  controller: class ResourceAnalysisController {
    // @ngInject
    constructor(currentStateService, projectsService, ResourceChartService) {
      this.ResourceChartService = ResourceChartService;
      this.currentStateService = currentStateService;
      this.projectsService = projectsService;
    }

    $onInit() {
      this.loading = true;
      this.currentStateService.getCustomer().then(customer => {
        this.customer = customer;
        this.pieChart = this.ResourceChartService.getPieChart(customer);
        this.total = this.ResourceChartService.getTotal(this.pieChart);
        return this.projectsService.getAll({
          customer: customer.uuid
        }).then(projects => {
          this.barChart = this.ResourceChartService.getBarChart(projects, this.total);
        });
      }).then(() => {
        this.loading = false;
      });
    }
  }
};

export default resourceAnalysis;
