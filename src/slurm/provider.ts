import { lazyComponent } from '@waldur/core/lazyComponent';
import * as ProvidersRegistry from '@waldur/providers/registry';

const SlurmForm = lazyComponent(
  () => import(/* webpackChunkName: "SlurmForm" */ './SlurmForm'),
  'SlurmForm',
);

const serializer = (fields) => ({
  hostname: fields.hostname,
  username: fields.username,
  port: fields.port,
  gateway: fields.gateway,
  use_sudo: fields.use_sudo,
  default_account: fields.default_account,
});

ProvidersRegistry.register({
  name: 'Batch processing',
  type: 'SLURM',
  icon: 'icon-slurm.png',
  endpoint: 'slurm',
  component: SlurmForm,
  serializer,
});
