import template from './slurm-allocation-checkout-summary.html';
import { getEstimatedPrice } from './utils';

class SummaryController {
  // @ngInject
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
      .loadPackage(this.model.service.settings)
      .then(result => this.package = result);
  }

  getEstimatedPrice() {
    if (!this.package) {
      return 0;
    }

    if (isNaN(this.model.cpu_limit) || isNaN(this.model.gpu_limit) || isNaN(this.model.ram_limit)) {
      return 0;
    }

    return getEstimatedPrice({
      cpu: this.model.cpu_limit,
      gpu: this.model.gpu_limit,
      ram: this.model.ram_limit,
    }, this.package);
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
