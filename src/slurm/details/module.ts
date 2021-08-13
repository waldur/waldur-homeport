import { lazyComponent } from '@waldur/core/lazyComponent';
import * as ResourceSummary from '@waldur/resource/summary/registry';
import { ResourceSummaryBase } from '@waldur/resource/summary/ResourceSummaryBase';

const SlurmAllocationSummary = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SlurmAllocationSummary" */ './SlurmAllocationSummary'
    ),
  'SlurmAllocationSummary',
);

ResourceSummary.register('SLURM.Allocation', SlurmAllocationSummary, false);
ResourceSummary.register('SLURM.Job', ResourceSummaryBase);
