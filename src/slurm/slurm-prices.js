import template from './slurm-prices.html';

const slurmPrices = {
  template,
  bindings: {
    provider: '<'
  },
  controller: class SlurmPricesController {
    // @ngInject
    constructor(SlurmPackagesService) {
      this.service = SlurmPackagesService;
    }

    $onInit() {
      this.loading = true;
      this.loadData().finally(this.loading = false);
    }

    loadData() {
      return this.service
        .loadPackage(this.provider.settings)
        .then(result => this.package = result);
    }
  }
};

export default slurmPrices;
