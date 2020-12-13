import { lazyComponent } from '@waldur/core/lazyComponent';
import * as ResourceSummary from '@waldur/resource/summary/registry';

const SlurmAllocationSummary = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SlurmAllocationSummary" */ './SlurmAllocationSummary'
    ),
  'SlurmAllocationSummary',
);

export default () => {
  ResourceSummary.register('SLURM.Allocation', SlurmAllocationSummary, '');
};
