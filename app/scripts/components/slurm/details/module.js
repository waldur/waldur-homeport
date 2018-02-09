import slurmAllocationDetailsDialog from './slurm-allocation-details-dialog';
import slurmAllocationUsageChart from './slurm-allocation-usage-chart';
import slurmAllocationUsageTable from './slurm-allocation-usage-table';
import SlurmAllocationUsageService from './slurm-allocation-usage-service';
import { SlurmAllocationSummary } from './SlurmAllocationSummary';
import * as ResourceSummary from '@waldur/resource/summary/registry';

export default module => {
  ResourceSummary.register('SLURM.Allocation', SlurmAllocationSummary);
  module.component('slurmAllocationDetailsDialog', slurmAllocationDetailsDialog);
  module.directive('slurmAllocationUsageChart', slurmAllocationUsageChart);
  module.component('slurmAllocationUsageTable', slurmAllocationUsageTable);
  module.service('SlurmAllocationUsageService', SlurmAllocationUsageService);
};
