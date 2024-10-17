import { lazyComponent } from '@waldur/core/lazyComponent';
import * as ProvidersRegistry from '@waldur/marketplace/offerings/update/integration/registry';

const SlurmForm = lazyComponent(() => import('./SlurmForm'), 'SlurmForm');

const SlurmRemoteForm = lazyComponent(
  () => import('./SlurmForm'),
  'SlurmRemoteForm',
);

ProvidersRegistry.register({
  name: 'Batch processing',
  type: 'SLURM',
  icon: 'icon-slurm.png',
  endpoint: 'slurm',
  component: SlurmForm,
});

ProvidersRegistry.register({
  name: 'Batch processing (agent)',
  type: 'SLURM remote',
  icon: 'icon-slurm.png',
  endpoint: 'slurm',
  component: SlurmRemoteForm,
});
