import * as ProvidersRegistry from '@waldur/providers/registry';

import { SlurmForm } from './SlurmForm';

const serializer = fields => ({
  batch_service: fields.batch_service.value,
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
