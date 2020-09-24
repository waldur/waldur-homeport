import * as ResourceSummary from '@waldur/resource/summary/registry';

import { SlurmAllocationSummary } from './SlurmAllocationSummary';

export default () => {
  ResourceSummary.register('SLURM.Allocation', SlurmAllocationSummary, '');
};
