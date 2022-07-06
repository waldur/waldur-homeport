import { lazyComponent } from '@waldur/core/lazyComponent';
import * as ProvidersRegistry from '@waldur/providers/registry';

const SlurmForm = lazyComponent(
  () => import(/* webpackChunkName: "SlurmForm" */ './SlurmForm'),
  'SlurmForm',
);

const SlurmRemoteForm = lazyComponent(
  () => import(/* webpackChunkName: "SlurmRemoteForm" */ './SlurmForm'),
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
  name: 'Batch processing (remote)',
  type: 'SLURM remote',
  icon: 'icon-slurm.png',
  endpoint: 'slurm',
  component: SlurmRemoteForm,
  serializer: serializerRemote,
});
