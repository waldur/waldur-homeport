import template from './resource-analysis-new.html';

const resourceAnalysis = {
  template,
  controller: class ResourceAnalysisController {
    constructor(currentStateService, projectsService, ResourceChartService) {
      // @ngInject
      this.ResourceChartService = ResourceChartService;
      this.currentStateService = currentStateService;
      this.projectsService = projectsService;
    }

    $onInit() {
      this.loading = true;
      this.currentStateService.getCustomer().then(customer => {
        this.pieChart = this.ResourceChartService.getPieChart(customer);
        return this.projectsService.getAll({
          customer: customer.uuid
        }).then(projects => {
          this.projects = projects.map(project => project.name);
          this.barChart = this.ResourceChartService.getBarChart(projects);
        });
      }).then(() => {
        this.loading = false;
      });
    }
  }
};

export default resourceAnalysis;
