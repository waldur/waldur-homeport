import template from './slurm-allocation-checkout-summary.html';

// @ngInject
class SummaryController {
  constructor($q, $scope, coreUtils, currentStateService, SlurmPackagesService) {
    this.$q = $q;
    this.$scope = $scope;
    this.coreUtils = coreUtils;
    this.currentStateService = currentStateService;
    this.SlurmPackagesService = SlurmPackagesService;
  }

  $onInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.$q.all([this.loadProject(), this.loadPackage()])
      .finally(() => this.loading = false);
  }

  loadProject() {
    return this.currentStateService.getProject()
      .then(project => this.project = project);
  }

  loadPackage() {
    return this.SlurmPackagesService
      .loadPackage(this.model.service_settings)
      .then(result => this.package = result);
  }

  getEstimatedPrice() {
    if (!this.package) {
      return 0;
    }

    if (isNaN(this.model.cpu_limit) || isNaN(this.model.gpu_limit) || isNaN(this.model.ram_limit)) {
      return 0;
    }

    const cpu_limit = this.model.cpu_limit / 60;
    const gpu_limit = this.model.gpu_limit / 60;
    const ram_limit = this.model.ram_limit / 1024;

    const cpu_price = this.package.cpu_price * cpu_limit;
    const gpu_price = this.package.gpu_price * gpu_limit;
    const ram_price = this.package.ram_price * ram_limit;
    return cpu_price + gpu_price + ram_price;
  }
}

const slurmAllocationCheckoutSummary = {
  template: template,
  controller: SummaryController,
  bindings: {
    model: '<'
  }
};

export default slurmAllocationCheckoutSummary;
