import { loadCharts } from './api';
import template from './slurm-allocation-usage-table.html';
import './slurm-allocation-usage-table.scss';

class SlurmAllocationUsageTableController {
  $onInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.erred = false;

    return loadCharts(this.resource.service_settings, this.resource.url)
      .then(({ users, charts }) => {
        this.users = users;
        this.charts = charts;
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
