import template from './slurm-allocation-usage-table.html';
import './slurm-allocation-usage-table.scss';
import { formatCharts } from './utils';
import { palette, getChartSpec } from './constants';

class SlurmAllocationUsageTableController {
  // @ngInject
  constructor(SlurmAllocationUsageService, SlurmPackagesService) {
    this.SlurmAllocationUsageService = SlurmAllocationUsageService;
    this.SlurmPackagesService = SlurmPackagesService;
  }

  $onInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.erred = false;

    return this.SlurmPackagesService.loadPackage(this.resource.service_settings)
      .then(pricePackage => {
        return this.SlurmAllocationUsageService.getAll({
          allocation: this.resource.url,
        }).then(rows => {
          const { users, charts } = formatCharts(
            palette,
            getChartSpec(),
            rows,
            pricePackage,
          );
          this.users = users;
          this.charts = charts;
        });
      })
      .catch(() => (this.erred = false))
      .then(() => (this.loading = false));
  }
}

const slurmAllocationUsageTable = {
  template,
  bindings: {
    resource: '<',
  },
  controller: SlurmAllocationUsageTableController,
};

export default slurmAllocationUsageTable;
