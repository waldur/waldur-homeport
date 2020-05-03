import * as ResourceSummary from '@waldur/resource/summary/registry';

import slurmAllocationDetailsDialog from './slurm-allocation-details-dialog';
import slurmAllocationUsageChart from './slurm-allocation-usage-chart';
import SlurmAllocationUsageService from './slurm-allocation-usage-service';
import slurmAllocationUsageTable from './slurm-allocation-usage-table';
import { SlurmAllocationSummary } from './SlurmAllocationSummary';

export default module => {
  ResourceSummary.register('SLURM.Allocation', SlurmAllocationSummary);
  module.component(
    'slurmAllocationDetailsDialog',
    slurmAllocationDetailsDialog,
  );
  module.directive('slurmAllocationUsageChart', slurmAllocationUsageChart);
  module.component('slurmAllocationUsageTable', slurmAllocationUsageTable);
  module.service('SlurmAllocationUsageService', SlurmAllocationUsageService);
};
