import slurmAllocationSummary from './slurm-allocation-summary';
import slurmAllocationDetailsDialog from './slurm-allocation-details-dialog';
import slurmAllocationUsageChart from './slurm-allocation-usage-chart';
import slurmAllocationUsageTable from './slurm-allocation-usage-table';
import SlurmAllocationUsageService from './slurm-allocation-usage-service';

export default module => {
  module.component('slurmAllocationSummary', slurmAllocationSummary);
  module.component('slurmAllocationDetailsDialog', slurmAllocationDetailsDialog);
  module.directive('slurmAllocationUsageChart', slurmAllocationUsageChart);
  module.component('slurmAllocationUsageTable', slurmAllocationUsageTable);
  module.service('SlurmAllocationUsageService', SlurmAllocationUsageService);
};
