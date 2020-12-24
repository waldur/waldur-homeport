import { lazyComponent } from '@waldur/core/lazyComponent';
import * as ResourceSummary from '@waldur/resource/summary/registry';

const SlurmAllocationSummary = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SlurmAllocationSummary" */ './SlurmAllocationSummary'
    ),
  'SlurmAllocationSummary',
);

ResourceSummary.register('SLURM.Allocation', SlurmAllocationSummary, false);
