import { lazyComponent } from '@waldur/core/lazyComponent';
import * as ProvidersRegistry from '@waldur/providers/registry';

const SlurmForm = lazyComponent(() => import('./SlurmForm'), 'SlurmForm');

const SlurmRemoteForm = lazyComponent(
  () => import('./SlurmForm'),
  'SlurmRemoteForm',
);

const serializer = (fields) => ({
  hostname: fields.hostname,
  username: fields.username,
  port: fields.port,
  gateway: fields.gateway,
  use_sudo: fields.use_sudo,
  default_account: fields.default_account,
});

const serializerRemote = () => ({});

ProvidersRegistry.register({
  name: 'Batch processing',
  type: 'SLURM',
  icon: 'icon-slurm.png',
  endpoint: 'slurm',
  component: SlurmForm,
  serializer,
});

ProvidersRegistry.register({
  name: 'Batch processing (agent)',
  type: 'SLURM remote',
  icon: 'icon-slurm.png',
  endpoint: 'slurm',
  component: SlurmRemoteForm,
  serializer: serializerRemote,
});
